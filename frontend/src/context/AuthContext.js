import instance from "../utils/Axios.js";
import qs from "qs";
import jwt_decode from "jwt-decode";
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
  //TODO: store user object instead of username
  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwt_decode(JSON.parse(localStorage.getItem("authTokens")).access)
          .username
      : null
  );

  const registerUser = async (userInfo) => {
    const { email, username, password } = userInfo;
    const csrfToken = await getCsrf();

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

  const loginUser = async (userInfo) => {
    const { login, password } = userInfo;
    const csrfToken = await getCsrf();

    const payload = {
      email: login.includes("@") ? login : "",
      username: !login.includes("@") ? login : "",
      password,
    };

    const res = await instance.post("/login/", qs.stringify(payload), {
      headers: {
        "X-CSRFToken": csrfToken,
      },
      withCredentials: true,
    });

    if (res.status === 200) {
      // 2 second timeout to allow for notifications to show up
      setTimeout(() => {
        setAuthTokens(res.data);
        setUser(jwt_decode(res.data.access).username);
        localStorage.setItem("authTokens", JSON.stringify(res.data));
      }, 1000);
    } else {
      throw new Error("Something went wrong.");
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
  };

  const getUserInfo = async (callback) => {
    const { data } = await instance.get("/getuserinfo/", {
      headers: {
        Authorization: `Bearer ${authTokens.access}`,
      },
      withCredentials: true,
    });

    if (typeof callback === "function") {
      callback(data);
    }
    return data;
  };

  const modUserInfo = async (newInfo) => {
    await instance.post("/moduserinfo/", newInfo, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authTokens.access}`,
      },
      withCredentials: true,
    });
  };

  let contextData = {
    user,
    getUserInfo,
    modUserInfo,
    loginUser,
    registerUser,
    logoutUser,
    authTokens,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
