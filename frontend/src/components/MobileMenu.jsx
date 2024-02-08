import { useContext } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiSettings } from "react-icons/fi";
import { MdLogout } from "react-icons/md";

import AuthContext from "../context/AuthContext";

function MobileMenu({ isOpen }) {
  const { logoutUser } = useContext(AuthContext);

  return (
    <div
      className={`Gelion-Semi-Bold absolute p-4 z-10 bottom-14  -translate-x-1/2 bg-white drop-shadow-md rounded-xl ${
        isOpen ? "" : "hidden"
      }`}
    >
      <ul className="text-[#0D162A] space-y-2">
        <li>
          {/* Here */}
          <Link className="flex items-center" to={"profile"}>
            <FiUser className="mr-1" size={"20px"} />
            Profile
          </Link>
        </li>
        <li>
          <Link className="flex items-center" to={"#"}>
            <FiSettings className="mr-1" size={"20px"} /> Settings
          </Link>
        </li>
        <li>
          <button
            onClick={() => {
              logoutUser();
            }}
            className="flex items-center"
          >
            <MdLogout className="mr-1" size="20px" color="#C11212" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}

export default MobileMenu;
