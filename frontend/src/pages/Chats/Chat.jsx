import { useState, useEffect, useRef, useContext } from "react";
import { useQuery } from "react-query";
import { useInView } from "react-intersection-observer";
import useWindowDimensions from "../../utils/useWindowDimensions";
import { FiArrowLeft } from "react-icons/fi";
import WebSocketContext from "../../context/WebSocket";
import useAxios from "../../utils/useAxios";
import Message from "./Message";

function Chat({ receiver, setOpenChat }) {
  const { lastMessage, sendMessage } = useContext(WebSocketContext);
  const api = useAxios();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(2);
  const [isIncomplete, setIsIncomplete] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [currentScroll, setCurrentScroll] = useState(null);

  const chatRef = useRef();
  const inputRef = useRef();

  const { username, id } = receiver;
  const { width } = useWindowDimensions();

  const { data, isLoading } = useQuery({
    queryKey: [`openChat${id}`],
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: () => api.get(`/getchat/${id}/1/20`),
    onSuccess: ({ data: msgs }) => {
      setMessages(msgs);
    },
  });

  const [ref, inView] = useInView({
    root: null,
    threshold: 0,
  });

  useEffect(() => {
    setMessages((l) => [...l, lastMessage]);
  }, [lastMessage]);

  // Scroll to the bottom when the chat is opened
  useEffect(() => {
    if (data && !hasScrolled) {
      const chatContainer = chatRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
      setHasScrolled(true);
    }
  }, [data, hasScrolled]);

  // Fetch more messages when scrolling to the top
  useEffect(() => {
    if (inView && hasScrolled && isIncomplete) {
      setCurrentScroll({
        scroll: chatRef.current.scrollTop,
        height: chatRef.current.scrollHeight,
      });

      api
        .get(`/getchat/${id}/${messagesPage}/20`)
        .then(({ data }) => {
          if (data) {
            setMessagesPage((l) => l + 1);
            setMessages((last) => data.concat(last));
          }
        })
        .catch(() => {
          setIsIncomplete(false);
        });
    }
  }, [inView, hasScrolled]);

  // Keep scroll position when more messages are fetched
  useEffect(() => {
    if (currentScroll && hasScrolled) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight - currentScroll.height;
    }
  }, [messages]);

  useEffect(() => {
    let input = inputRef.current;
    inputRef.current.focus();
    function enterKey({ key }) {
      if (key === "Enter") {
        console.log(`El mensaje actual es: ${message}`);
        handleSend();
      }
    }
    inputRef.current.addEventListener("keyup", enterKey);

    return () => {
      input.removeEventListener("keyup", enterKey);
    };
  }, [message]);

  function handleSend() {
    if (message.trim() === "") return;
    sendMessage(receiver.id, message);
    setMessages((last) => [
      ...last,
      {
        content: message,
        receiver: receiver.id,
        // id: Math.random() + message, // FIXME: Cambiar esto algo que siempre sea unico (puede ser un contador)
      },
    ]);
    setMessage("");
    setTimeout(() => {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, 0);
  }

  return (
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
          src={receiver.profileimg}
          width={"41px"}
          className="aspect-square rounded-full object-cover inline mr-4"
          alt=""
        />
        {username}
      </div>
      {/* Chat messages */}
      <div
        ref={chatRef}
        id="messages"
        className="flex flex-col overflow-scroll h-[calc(100vh-(74px+76px))] p-4"
      >
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className={`spinner ${isIncomplete ? "" : "hidden mt-4"}`}>
              <div className="bounce1"></div>
              <div className="bounce2"></div>
              <div className="bounce3"></div>
            </div>
          </div> // Replace with loading icon
        ) : (
          <>
            {/* Marker to fetch more messages */}
            <div className="flex justify-center items-center" ref={ref}>
              {inView ? (
                <div className={`spinner ${isIncomplete ? "" : "hidden mt-4"}`}>
                  <div className="bounce1"></div>
                  <div className="bounce2"></div>
                  <div className="bounce3"></div>
                </div>
              ) : null}
            </div>

            {messages.map((x) => (
              <Message message={x} chatRef={chatRef} setMenu={setMessageMenu} />
            ))}
          </>
        )}
      </div>
      {/* Input */}
      <div className=" p-4 w-full">
        <div className="flex rounded-full overflow-hidden focus-within:outline outline-1 outline-[blue] border border-2 border-">
          <input
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            value={message}
            type="text"
            name="message"
            placeholder="Message"
            id="msg"
            ref={inputRef}
            className="flex-grow-[2] border-none focus:outline-none focus:ring-0"
          />
          <button
            onClick={handleSend}
            disabled={message.trim() === "" ? true : false}
            className="flex-grow-[0.1]"
          >
            <FiArrowLeft
              size={"20px"}
              className={`rotate-180 mx-auto ${
                message.trim() === ""
                  ? "text-[hsl(220,13%,50%)]"
                  : "text-[#4558ff]"
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;
