import { useEffect } from "react";
import { BiLeftArrowAlt } from "react-icons/bi";

function Modal({ children, label, confirmLabel, confirmClick, setIsOpen }) {
  useEffect(() => {
    function escape(e) {
      if (e.key == "Escape") {
        document.body.style.overflow = "auto";
        setIsOpen(false);
      }
    }
    function click(e) {
      console.log(e.target.classList);
      if (e.target.classList.contains("z-50")) {
        document.body.style.overflow = "auto";
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", escape);
    document.addEventListener("click", click);

    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("click", click);
    };
  }, []);

  return (
    <div className="fixed inset-0 sm:bg-[#0d162acd] bg-white z-50 p-4">
      <div className="absolute w-full sm:w-auto left-1/2 -translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 bg-white rounded-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center text-xl Gelion-Medium border-b text-[#3c3d44] p-4">
          <button
            onClick={() => {
              document.body.style.overflow = "auto";
              setIsOpen(false);
            }}
          >
            <BiLeftArrowAlt size={"30px"} color="#3c3d44" />
          </button>
          {label}
          {confirmLabel && (
            <button onClick={confirmClick} className="ml-auto mr-2">
              {confirmLabel}
            </button>
          )}
        </div>
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
