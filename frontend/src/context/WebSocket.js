import { createContext, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

const WebSocketContext = createContext();

export default WebSocketContext;

export const WebSocketProvider = ({ children }) => {
  const [WebSocketS, setWebSocketS] = useState(null);
  const [lastMessage, setLastMessage] = useState("");
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    // Avoid crashing when token expires
    if (authTokens) {
      const ws = new WebSocket(
        "ws://localhost:8000/ws/chats/",
        authTokens.access
      );

      ws.onopen = () => {
        console.log("WebSocket connected.");
        setWebSocketS(ws);
      };
      ws.onclose = () => {
        console.log("WebSocket disconnected.");
        setWebSocketS(null);
      };
      ws.onerror = (err) => {
        console.log(err);
      };
      ws.onmessage = ({ data }) => {
        setLastMessage(JSON.parse(data));
      };

      return () => {
        ws.close();
      };
    }
  }, []);

  function close() {
    if (WebSocketS) {
      WebSocketS.close();
      setWebSocketS(null);
    }
  }

  /**
   * Sends a message through the websocket connection
   * @param {Number} dest Destination id
   * @param {String} msg Message
   */
  function sendMessage(dest, msg) {
    if (WebSocketS) {
      WebSocketS.send(
        JSON.stringify({
          content: msg,
          receiver: dest,
        })
      );
    }
  }

  return (
    <WebSocketContext.Provider
      value={{
        ws: WebSocketS,
        lastMessage,
        close,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
