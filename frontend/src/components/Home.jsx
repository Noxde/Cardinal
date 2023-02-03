import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Home() {
  let { user, logoutUser } = useContext(AuthContext);

  return (
    <div className="max-w-[200px] space-y-2">
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

      {user && <button onClick={logoutUser}>Log out</button>}
    </div>
  );
}

export default Home;
