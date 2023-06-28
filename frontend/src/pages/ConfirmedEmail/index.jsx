import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import instance from "../../utils/Axios";
import NotFound from "../404/index";

function ConfirmedEmail() {
  const [redirect, setRedirect] = useState(false);
  const params = useParams();

  const { isLoading, data, isError, error } = useQuery(
    "confirmedEmail",
    () => {
      return instance.get(`/showvalidationpage/${params.user}/`, {
        withCredentials: true,
      });
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return;
  }
  if (isError || data.data?.status?.includes("denied")) {
    return <NotFound />;
  }

  let timeout = setTimeout(() => {
    setRedirect(true);
  }, 5000);

  return !redirect ? (
    <div className="min-h-screen grid place-items-center Gelion-Regular text-[#606161] py-5">
      <div className="text-center">
        <h1 className="text-4xl Gelion-Semi-Bold text-[#131313] mb-4">
          Email verified successfully
        </h1>
        <p className="text-lg">
          You are being redirected to the signin page...
        </p>
      </div>
    </div>
  ) : (
    <Navigate to={"/login"} state={{ username: params.user }} />
  );
}

export default ConfirmedEmail;
