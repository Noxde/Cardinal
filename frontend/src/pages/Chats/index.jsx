import "./messages.css";

import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import useWindowDimensions from "../../utils/useWindowDimensions";

import AuthContext from "../../context/AuthContext";

import useAxios from "../../utils/useAxios";
import ChatItem from "./ChatItem";
import NoChats from "./NoChats";
import Followers from "./Followers";

import { FiPlusCircle, FiArrowLeft } from "react-icons/fi";
import Chat from "./Chat";

function Chats() {
  const api = useAxios();
  const nav = useNavigate();

  const { authTokens, user } = useContext(AuthContext);

  const [showFollowers, setShowFollowers] = useState(false);
  const [openChat, setOpenChat] = useState(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!authTokens) {
      nav("/login/"); // If user is not logged in, redirect to login (should instead have "protected" routes)
    }
  }, [authTokens]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: "openChats",
    queryFn: () => api.get("/getopenchats/"),
  });

  return (
    <div className="h-full md:grid grid-cols-[1fr,1.5fr] bg-white">
      <div id="chats" className={`border-r md:block ${openchat && "hidden"}`}>
        <div className="header flex justify-between items-center px-4 py-6 Gelion-Medium dark-blue border-b">
          <span>Chats</span>{" "}
          <FiPlusCircle
            onClick={() => {
              setShowFollowers(true);
            }}
            className="inline cursor-pointer"
            size={"25px"}
          />
        </div>
        {/* Check if the request is loading or if there are no open chats */}
        {data?.data.length > 0 ? (
          data?.data.map((x) => (
            <ChatItem
              key={x.id}
              username={x.chat_user.username}
              profilePicture={x.chat_user.profileimg}
              onClick={() => {
                setOpenChat(x);
              }}
            />
          ))
        ) : (
          <NoChats showFollowers={setShowFollowers} />
        )}
        {showFollowers && (
          <Followers
            setOpenChat={setOpenChat}
            setShowFollowers={setShowFollowers}
            followers={user.followers}
            chats={data?.data}
            currentChat={openchat}
          />
        )}
      </div>
      <div id="openchat" className={`hidden md:block ${openChat && "!block"}`}>
        {openChat ? (
          <Chat
            receiver={openChat.chat_user}
            setOpenChat={setOpenChat}
            key={openChat.chat_user.username}
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-xl Gelion-Medium text-center max-w-md dark-blue">
              Here you will see your selected chat, select a chat from the list
              and start a conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chats;
