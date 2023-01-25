import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function PrivateRoutes() {
  const { user } = useContext(AuthContext);

  return !user ? <Outlet /> : <Navigate to="/" />;
}

export default PrivateRoutes;
