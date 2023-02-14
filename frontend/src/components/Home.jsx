import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Home() {
  let { user, logoutUser } = useContext(AuthContext);

  return (
    <div className="w-full h-screen space-y-2 bg-slate-900 text-white">
      {user && <h1>{user}</h1>}

      <Link className="block btn" to="register">
        Sign up
      </Link>
      <Link className="block btn" to="login">
        Sign in
      </Link>
      <Link className="block btn" to="404">
        404
      </Link>
      <Link className="block btn" to="profile">
        Profile
      </Link>

      {user && <button onClick={logoutUser}>Log out</button>}
    </div>
  );
}

export default Home;
