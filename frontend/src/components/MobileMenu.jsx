import { CgProfile } from "react-icons/cg";
import { Link } from "react-router-dom";
import { MdSettings } from "react-icons/md";

function MobileMenu({ isOpen }) {
  return (
    <div
      className={`Gelion-Semi-Bold absolute p-4 z-10 bottom-14  -translate-x-1/2 bg-white drop-shadow-md rounded-xl ${
        isOpen ? "" : "hidden"
      }`}
    >
      <ul className="text-[#0D162A]">
        <li className="mb-1">
          {/* Here */}
          <Link className="flex" to={"profile"}>
            <CgProfile className="mr-1" size={"20px"} />
            Profile
          </Link>
        </li>
        <li>
          <Link className="flex" to={"#"}>
            <MdSettings className="mr-1" size={"20px"} /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default MobileMenu;
