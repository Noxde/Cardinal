import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";

function LoginConfirmEmail({ formik, setEmailVerification }) {
  const { sendEmail } = useContext(AuthContext);
  const [validEmail, setValidEmail] = useState(false);

  return (
    <div className="bg-[#000000b1] fixed inset-0 grid place-items-center p-4">
      <div className="bg-white p-4 rounded-xl">
        <h2 className="text-4xl Gelion-Semi-Bold text-[#131313]">
          Verify your email address
        </h2>
        <p className="Gelion-Regular text-[#606161]">
          Enter your email address to receive a new verification email.
        </p>
        <input
          className={`w-full rounded-lg border-[#9C9D9F] mt-4`}
          type="text"
          name="confirmationEmail"
          placeholder="Enter your email"
          onChange={(e) => {
            let emailInput = e.target.value;

            formik.values.login = emailInput;
            if (emailInput.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
              setValidEmail(true);
            } else {
              setValidEmail(false);
            }
          }}
        />
        <button
          className="enabled:bg-[#4558ff] text-white w-full mt-5 rounded-full py-3 Gelion-Semi-Bold cursor-pointer enabled:hover:brightness-90 enabled:active:outline enabled:active:outline-offset-4 enabled:active:outline-4 enabled:active:outline-[#4558ff] disabled:bg-[hsl(234,100%,20%)] disabled:cursor-not-allowed"
          type="button"
          disabled={!validEmail}
          onClick={() => {
            sendEmail("EC", formik.values.login);
            setEmailVerification(true);
          }}
        >
          Verify your email
        </button>
      </div>
    </div>
  );
}

export default LoginConfirmEmail;
