import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import dayjs from "dayjs";
import { IoIosArrowDown } from "react-icons/io";

function Message({ message, setMenu }) {
  const { user } = useContext(AuthContext);
  const { id, receiver, content, creation_time: creationTime } = message;
  const isOwn = receiver !== user.id;

  const timestamp = creationTime ? dayjs(creationTime) : dayjs();

  return (
    <div
      className="message relative max-w-xs p-2 rounded-2xl flex flex-col group"
      // TODO: Change key
      key={id || `${receiver}${content}`}
      data-sender={isOwn ? "own" : "chat"}
    >
      {isOwn && (
        <div className="absolute hidden bg-gradient-to-l from-[hsl(234,100%,58%)] from-100% h-full top-0 right-0 rounded-tr-2xl group-hover:block">
          <button
            className="flex pr-0.5"
            onClick={(e) => {
              let msg = e.currentTarget.parentElement;
              let { height, top, right } = msg.getBoundingClientRect();

              if (top <= 74) {
                setMenu((current) => ({
                  ...current,
                  top: msg.getBoundingClientRect().height + 5 + "px",
                }));
              } else {
                setMenu({
                  pos: {
                    x: right + "px",
                    y: top - 35 + "px",
                  },
                  id,
                  isOpen: true,
                });
              }
            }}
          >
            <IoIosArrowDown size="20px" className="text-gray-100" />
          </button>
        </div>
      )}
      <p>{content}</p>
      <span className="text-sm text-gray-500">
        {timestamp.format("hh:mm A")}
      </span>
    </div>
  );
}

export default Message;
