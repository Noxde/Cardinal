import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import dayjs from "dayjs";
import jwtDecode from "jwt-decode";

const useAxios = () => {
  const { authTokens, user, setUser, setAuthTokens } = useContext(AuthContext);
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${authTokens?.access}`,
    },
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(async (req) => {
    const userToken = jwtDecode(authTokens.access);
    const isExpired = dayjs.unix(userToken.exp).diff(dayjs()) < 1;

    if (!isExpired) return req;

    const response = await axios.post(
      "http://localhost:8000/login/token/refresh/",
      {
        refresh: authTokens.refresh,
      }
    );

    localStorage.setItem("authTokens", JSON.stringify(response.data));
    setAuthTokens(response.data);
    setUser({ ...user, ...jwtDecode(response.data.access) });

    req.headers.Authorization = `Bearer ${response.data.access}`;
    return req;
  });

  return axiosInstance;
};

export default useAxios;
