import "./messages.css";

import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import useWindowDimensions from "../../utils/useWindowDimensions";

import AuthContext from "../../context/AuthContext";
import WebSocketContext from "../../context/WebSocket";

import useAxios from "../../utils/useAxios";
import ChatItem from "./ChatItem";
import NoChats from "./NoChats";
import Followers from "./Followers";

import { FiPlusCircle, FiArrowLeft } from "react-icons/fi";

function Chats() {
  const api = useAxios();
  const nav = useNavigate();

  const { authTokens, user } = useContext(AuthContext);
  const { sendMessage, lastMessage } = useContext(WebSocketContext);

  const chatRef = useRef();
  const [showFollowers, setShowFollowers] = useState(false);
  const [openchat, setOpenChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!authTokens) {
      nav("/login/"); // If user is not logged in, redirect to login (should instead have "protected" routes)
    }
  }, [authTokens]);

  // Reset messages
  useEffect(() => {
    setMessages([]);
  }, [openchat]);

  // Update messages
  useEffect(() => {
    setMessages((last) => [...last, lastMessage]);
  }, [lastMessage]);

  // Scroll whenever theres a new message
  useEffect(() => {
    chatRef.current?.scrollIntoView();
  }, [messages]);

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
              setMessages={setMessages}
              setOpenChat={() => {
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
      <div id="openchat" className={`hidden md:block ${openchat && "!block"}`}>
        {openchat ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-4 Gelion-Medium dark-blue border-b">
              {/* Only shows on mobile, needed to backout from a chat */}
              {width < 768 && (
                <FiArrowLeft
                  onClick={() => {
                    setOpenChat(null);
                  }}
                  size={"20px"}
                  className="mr-2 inline cursor-pointer"
                />
              )}
              <img
                src={openchat.chat_user.profileimg}
                width={"41px"}
                className="aspect-square rounded-full object-cover inline mr-4"
                alt=""
              />
              {openchat.chat_user.username}
            </div>
            {/* Chat (could be a separate component) */}
            {/* Chat messages */}
            <div
              id="messages"
              className="flex flex-col overflow-scroll lg:h-[calc(100vh-(73px+45px))] p-4 md:h-[calc(100vh-15rem)] h-[calc(100vh-15rem)]"
            >
              {messages.map((x) => (
                // #TODO: Message component with custom context menu
                <div
                  ref={chatRef}
                  className={`message max-w-xs p-2 rounded-2xl ${
                    x.receiver !== user.id
                      ? "bg-[#4558ff] text-white rounded-br-none"
                      : "bg-[hsl(234,100%,97%)] rounded-tl-none"
                  }`}
                  key={x.id}
                  data-sender={x.receiver !== user.id ? "own" : "chat"}
                >
                  {x.content}
                </div>
              ))}
            </div>
            {/* Input */}
            <div className="flex">
              <input
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                value={message}
                type="text"
                name="message"
                id="msg"
                className="w-full"
              />
              <button
                onClick={() => {
                  sendMessage(openchat.chat_user.id, message);
                  setMessages((last) => [
                    ...last,
                    {
                      content: message,
                      receiver: openchat.chat_user.id,
                    },
                  ]);
                  setMessage("");
                }}
              >
                Send
              </button>
            </div>
          </>
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
