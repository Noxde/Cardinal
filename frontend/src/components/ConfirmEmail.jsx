import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ConfirmEmail({ formik }) {
  const { sendEmail } = useContext(AuthContext);

  const [disableResend, setDisableResend] = useState(false);
  const [timeoutTime, setTimeoutTime] = useState(0);
  const [timer, setTimer] = useState(false);

  let timerInterval;

  async function handleResend() {
    setDisableResend(true);
    toast.loading("Sending email...", { toastId: "confirm" });

    let status = await sendEmail(
      "EC",
      formik.values.email || formik.values.login
    );

    if (status === "Email confirmation email sent.") {
      toast.update("confirm", {
        render: "Email sent, check your inbox",
        type: "success",
        isLoading: false,
        autoClose: 2_000,
      });
    } else {
      toast.update("confirm", {
        render: "Something went wrong, try again later.",
        type: "error",
        isLoading: false,
        autoClose: 2_000,
      });
    }
    setTimeoutTime(10);
    setTimer(true);

    timerInterval = setInterval(() => {
      setTimeoutTime((prev) => prev - 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(timerInterval);
      setDisableResend(false);
      setTimer(false);
    }, 10_000);
  }

  return (
    <>
      <ToastContainer theme="colored" />
      <div className="min-h-screen grid place-items-center Gelion-Regular text-[#606161] p-5">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl Gelion-Semi-Bold text-[#131313]">
            Verify your email address
          </h1>
          <p className="text-lg max-w-[40rem]">
            Please click on the link that has just been sent to your email
            account to verify your email and continue the registration process.
          </p>
          <p className="text-sm">
            Didn't receive an email? Click{" "}
            <button
              className="underline"
              type="button"
              disabled={disableResend}
              onClick={async () => await handleResend()}
            >
              here
            </button>{" "}
            to resend it.
          </p>
          {timer && (
            <span>
              You have to wait {timeoutTime} seconds before requesting another
              email.
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default ConfirmEmail;
