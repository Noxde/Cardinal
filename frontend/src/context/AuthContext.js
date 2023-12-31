import instance from "../utils/Axios.js";
import qs from "qs";
import jwt_decode from "jwt-decode";
import { createContext, useState } from "react";

const AuthContext = createContext();

const getCsrf = async () => {
  let {
    data: { csrfToken },
  } = await instance.get("/csrf/", {
    withCredentials: true,
  });
  return csrfToken;
};

export default AuthContext;

export const AuthProvider = ({ children }) => {
  //TODO: store user object instead of username
  const [user, setUser] = useState(() =>
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  const [authTokens, setAuthTokens] = useState(() => {
    let cookies = document.cookie.split(";");
    let match = cookies.filter((x) => x.includes("authTokens"));
    let token = match.length > 0 ? JSON.parse(match[0].split("=")[1]) : null;
    // If authTokens no longer exist delete user from localStorage
    // FIXME: authTokens becomes null after refreshing the site when jwt expires (15 minutes)
    if (!token) {
      setUser(null);
      console.info("authTokens is null, deleting user");
      console.info("could refresh token instead");
      return;
    }

    return token; // Set tokens if they exist
  });

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
    const { id, password } = userInfo;
    const csrfToken = await getCsrf();

    const payload = {
      id,
      password,
    };

    console.log(payload);

    const res = await instance.post("/login/", qs.stringify(payload), {
      headers: {
        "X-CSRFToken": csrfToken,
      },
      withCredentials: true,
    });

    if (res.status === 200) {
      // 2 second timeout to allow for notifications to show up
      setTimeout(async () => {
        let { data } = await instance.get("/getuserinfo/", {
          headers: {
            Authorization: `Bearer ${res.data.access}`,
          },
          withCredentials: true,
        });
        // Update states
        setAuthTokens(res.data);
        setUser(data);

        // Get expiry date
        let expires = new Date(Number(`${jwt_decode(res.data.access).exp}000`));

        // Update tokens cookie
        document.cookie = `authTokens=${JSON.stringify(
          res.data
        )};expires=${expires.toUTCString()};`;

        localStorage.setItem("user", JSON.stringify(data));
      }, 1000);
    } else {
      throw new Error("Something went wrong.");
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    document.cookie = "authTokens=;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("user");
  };

  /**
   *
   * @param {"EC" | "PR" | "AD"} subject
   * @param {string} email
   * @returns status
   */
  const sendEmail = async (subject, email) => {
    const csrfToken = await getCsrf();

    try {
      let {
        data: { status },
      } = await instance.get(`/sendemail/${subject}/${email}`, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
        withCredentials: true,
      });
      return status;
    } catch (err) {
      return err.response?.data?.status || "Something went wrong.";
    }
  };

  let contextData = {
    user,
    setUser,
    loginUser,
    sendEmail,
    registerUser,
    logoutUser,
    authTokens,
    setAuthTokens,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
