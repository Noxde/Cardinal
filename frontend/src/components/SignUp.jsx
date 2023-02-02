import { useState, useContext } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { SignUpSchema } from "../schema";
import AuthContext from "../context/AuthContext";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignUp() {
  const navigate = useNavigate();
  const { registerUser } = useContext(AuthContext);
  const [disable, setDisable] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      match: "",
    },
    validationSchema: SignUpSchema,

    onSubmit: async (values) => {
      try {
        //Send register
        setDisable(true);
        toast.loading("Signing up...", { toastId: "signup" });
        await registerUser({
          email: values.email,
          username: values.username,
          password: values.password,
        });
        toast.update("signup", {
          render: "Signed up successfuly. Redirecting to Sign in...",
          type: "success",
          isLoading: false,
        });
        setTimeout(() => {
          navigate("/login");
        }, 2_000);
      } catch (err) {
        toast.update("signup", {
          render:
            err.response?.data.status ||
            "Something went wrong, try again later.",
          type: "error",
          isLoading: false,
          autoClose: 3_000,
          closeOnClick: true,
          closeButton: true,
          draggable: true,
          onClose: () => setDisable(false),
        });
      }
    },
  });

  return (
    <div className="min-h-screen grid place-items-center Gelion-Regular text-[#606161] py-5">
      <div className="w-full px-4">
        <div className="text-center space-y-4 mb-5">
          <img
            src={"/logo.svg"}
            className="mx-auto"
            width="50px"
            alt="bird logo"
          />
          <h1 className="text-4xl Gelion-Semi-Bold text-[#131313]">Sign up</h1>
          <p className="max-w-[17rem] mx-auto text-lg">
            Welcome! Enter your email and password below to sign up.
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="text-[#131313] max-w-lg mx-auto"
        >
          <ToastContainer theme="colored" />

          {/* Email input */}
          <label className="block Gelion-Semi-Bold" htmlFor="email">
            Email
          </label>
          <input
            className={`w-full rounded-lg border-[#9C9D9F] mt-2 ${
              formik.touched.email && formik.errors.email ? "input-error" : ""
            }`}
            type="email"
            name="email"
            placeholder="Email"
            value={formik.values.email}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-[#f14141]">{formik.errors.email}</p>
          )}

          {/* Username input */}
          <label className="block Gelion-Semi-Bold mt-5" htmlFor="email">
            Username
          </label>
          <input
            className={`w-full rounded-lg border-[#9C9D9F] mt-2 ${
              formik.touched.username && formik.errors.username
                ? "input-error"
                : ""
            }`}
            type="text"
            name="username"
            placeholder="Username"
            value={formik.values.username}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          {formik.touched.username && formik.errors.username && (
            <p className="text-[#f14141]">{formik.errors.username}</p>
          )}

          {/* Password inputs */}
          <div className="flex justify-between">
            <div className="flex-1 mr-5">
              <label className="block mt-5 Gelion-Semi-Bold" htmlFor="password">
                Password
              </label>
              <input
                className={`w-full rounded-lg border-[#9C9D9F] mt-2 ${
                  formik.touched.password && formik.errors.password
                    ? "input-error"
                    : ""
                }`}
                type="password"
                name="password"
                placeholder="Password"
                value={formik.values.password}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-[#f14141]">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex-1">
              <label className="mt-5 block Gelion-Semi-Bold" htmlFor="password">
                Confirm password
              </label>
              <input
                className={`w-full rounded-lg border-[#9C9D9F] mt-2 ${
                  formik.touched.match && formik.errors.match
                    ? "input-error"
                    : ""
                }`}
                type="password"
                name="match"
                placeholder="Repeat password"
                value={formik.values.match}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
              {formik.touched.match && formik.errors.match && (
                <p className="text-[#f14141]">{formik.errors.match}</p>
              )}
            </div>
          </div>

          <input
            className="enabled:bg-[#4558ff] text-white w-full mt-5 rounded-lg py-3 Gelion-Semi-Bold cursor-pointer enabled:hover:brightness-90 enabled:active:outline enabled:active:outline-offset-4 enabled:active:outline-4 enabled:active:outline-[#4558ff] disabled:bg-[hsl(234,100%,20%)] disabled:cursor-not-allowed"
            type="submit"
            disabled={disable ? true : false}
            value="Sign up"
          />
        </form>

        <p className="text-center mt-5">
          Already have an account?
          <Link className="ml-3 Gelion-Semi-Bold text-[#131313]" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
