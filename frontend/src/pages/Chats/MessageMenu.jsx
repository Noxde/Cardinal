import useAxios from "../../utils/useAxios";
import { useEffect, useRef } from "react";

function MessageMenu({ menu, setMenu, setMessages }) {
  const { pos, id, isOpen } = menu;
  const menuRef = useRef();
  const buttonRef = useRef(null); // Add this line
  const api = useAxios();

  useEffect(() => {
    function handleClick(e) {
      const clickedButton = e.target.closest("button");

      if (menuRef.current) {
        if (
          (!e.target.id !== "deleteMessage" && !e.target.closest("button")) ||
          clickedButton === buttonRef.current
        ) {
          setMenu((current) => ({ ...current, isOpen: false }));
          menuRef.current = null;
        }
      }
      buttonRef.current = clickedButton;
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      style={{
        top: pos.y,
        right: "15px",
      }}
      className="absolute whitespace-nowrap right-0 bg-white dark-blue rounded-lg p-1 z-10 drop-shadow-xl"
    >
      <ul>
        <li>
          <button
            id="deleteMessage"
            onClick={async () => {
              setMenu((current) => ({ ...current, isOpen: false }));
              await api.post("http://localhost:8000/deletemessage/", {
                messageid: id,
              });
              setMessages((messages) => messages.filter((x) => x.id !== id));
            }}
          >
            Delete message
          </button>
        </li>
      </ul>
    </div>
  );
}
export default MessageMenu;
