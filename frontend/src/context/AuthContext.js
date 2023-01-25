import instance from "../utils/Axios.js";
import qs from "qs";
// import jwt_decode from "jwt-decode";
import { createContext, useState } from "react";

const AuthContext = createContext();

const getCsrf = async () => {
  let {
    data: { csrfToken },
  } = await instance.get("/csrf", {
    withCredentials: true,
  });
  return csrfToken;
};

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens")).access
      : null
  );

  let registerUser = async (userInfo) => {
    let { email, username, password } = userInfo;
    let csrfToken = await getCsrf();

    await instance.post(
      "/register/",
      qs.stringify({
        email,
        username,
        password,
      }),
      {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      }
    );
  };

  let loginUser = async (userInfo) => {
    let { login, password } = userInfo;
    let csrfToken = await getCsrf();

    let payload = {
      email: login.includes("@") ? login : "",
      username: !login.includes("@") ? login : "",
      password,
    };

    let res = await instance.post("/login/", qs.stringify(payload), {
      headers: {
        "X-CSRFToken": csrfToken,
      },
      withCredentials: true,
    });

    if (res.status === 200) {
      // 2 second timeout to allow for notifications to show up
      setTimeout(() => {
        setAuthTokens(res.data);
        setUser(res.data.access);
        localStorage.setItem("authTokens", JSON.stringify(res.data));
      }, 2_000);
    } else {
      throw new Error("Something went wrong.");
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
  };

  let contextData = {
    user,
    loginUser,
    logoutUser,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
