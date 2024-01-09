import "./messages.css";

import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";

import AuthContext from "../../context/AuthContext";
import WebSocketContext from "../../context/WebSocket";

import useAxios from "../../utils/useAxios";
import ChatItem from "./ChatItem";
import NoChats from "./NoChats";
import Followers from "./Followers";

import { FiPlusCircle } from "react-icons/fi";

function Chats() {
  const api = useAxios();
  const nav = useNavigate();

  const { authTokens, user } = useContext(AuthContext);
  const { sendMessage, lastMessage } = useContext(WebSocketContext);

  const chatRef = useRef();
  const [showFollowers, setShowFollowers] = useState(false);
  const [chats, setChats] = useState([]);
  const [openchat, setOpenChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

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

  const { isLoading, isError, error } = useQuery(
    "getOpenChats",
    () => api.get("/getopenchats/"),
    {
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000,
      onSuccess: ({ data }) => {
        setChats(data);
      },
    }
  );

  return (
    <div className="h-full grid grid-cols-[1fr,1.5fr] bg-white">
      <div id="chats" className="border-r">
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
        {chats.length > 0 ? (
          chats.map((x) => (
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
            chats={chats}
            currentChat={openchat}
          />
        )}
      </div>
      <div id="openchat">
        {openchat ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-4 Gelion-Medium dark-blue border-b">
              <img
                src={openchat.chat_user.profileimg}
                width={"41px"}
                className="aspect-square rounded-full object-cover inline mr-4"
                alt=""
              />
              {openchat.chat_user.username}
            </div>
            {/* Chat (could be a separate component) */}
            <div>
              {/* Chat messages */}
              <div
                id="messages"
                className="flex flex-col overflow-scroll h-[calc(100vh-(73px+43px))] p-4"
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
              <input
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                value={message}
                type="text"
                name="message"
                id="msg"
                className="w-auto"
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
