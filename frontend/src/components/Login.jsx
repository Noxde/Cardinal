import { useContext, useState } from "react";
import { Link } from "react-router-dom";

import { useFormik } from "formik";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoginSchema } from "../schema/index.js";
import AuthContext from "../context/AuthContext.js";

function Login() {
  let { loginUser } = useContext(AuthContext);
  const [disableSign, setDisableSign] = useState(false);

  const formik = useFormik({
    initialValues: {
      login: "",
      password: "",
      keepLogged: "",
    },
    validationSchema: LoginSchema,
    //Submit Form
    onSubmit: async (values) => {
      console.log("Submitted");
      setDisableSign(true);
      toast.loading("Signing in...", {
        toastId: "signin",
      });

      try {
        await loginUser({
          login: values.login,
          password: values.password,
          keepLogged: values.keepLogged,
        });

        toast.update("signin", {
          type: "success",
          render: "Successfully signed in. Redirecting to home...",
          isLoading: false,
        });
      } catch (err) {
        console.error(err);

        toast.update("signin", {
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
          closeButton: true,
          draggable: true,
          render: "Something went wrong, try again later.",
          onClose: () => setDisableSign(false),
        });
      }
    },
  });

  return (
    <div className="min-h-screen grid place-items-center Gelion-Regular text-[#606161] py-8">
      <div className="w-full px-4">
        <div className="text-center space-y-4 mb-5">
          <img
            src={"/logo.svg"}
            className="mx-auto"
            width="50px"
            alt="bird logo"
          />
          <h1 className="text-4xl Gelion-Semi-Bold text-[#131313]">Sign in</h1>
          <p className="max-w-[22rem] mx-auto text-lg">
            Welcome back! Enter your email/username and password below to sign
            in.
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="text-[#131313] max-w-lg mx-auto"
        >
          <ToastContainer theme="colored" />
          <label className="block Gelion-Semi-Bold" htmlFor="login">
            Email/Username
          </label>
          <input
            className={`w-full rounded-lg border-[#9C9D9F] mt-2 ${
              formik.touched.login && formik.errors.login ? "input-error" : ""
            }`}
            type="text"
            name="login"
            placeholder="Enter your user or email"
            value={formik.values.login}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          {formik.touched.login && formik.errors.login && (
            <p className="text-[#f14141]">{formik.errors.login}</p>
          )}

          <label className="block Gelion-Semi-Bold  mt-5" htmlFor="password">
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
            placeholder="Enter your password"
            value={formik.values.password}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-[#f14141]">{formik.errors.password}</p>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <input
                className="rounded-md"
                type="checkbox"
                name="keepLogged"
                id="keepLogged"
                onChange={formik.handleChange}
              />
              <label
                className="Gelion-Semi-Bold text-sm ml-2"
                htmlFor="keepLogged"
              >
                Keep me logged in
              </label>
            </div>

            <Link
              className="text-sm Gelion-Semi-Bold text-[#606161]"
              to={"/reset-password"}
            >
              Forgot password
            </Link>
          </div>

          <input
            className="enabled:bg-[#4558ff] text-white w-full mt-5 rounded-lg py-3 Gelion-Semi-Bold cursor-pointer enabled:hover:brightness-90 enabled:active:outline enabled:active:outline-offset-4 enabled:active:outline-4 enabled:active:outline-[#4558ff] disabled:bg-[hsl(234,100%,20%)] disabled:cursor-not-allowed"
            type="submit"
            disabled={disableSign}
            value="Sign in"
          />
        </form>

        <p className="text-center mt-5">
          Don't have an account?
          <Link className="ml-3 Gelion-Semi-Bold text-[#131313]" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
