import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  // TODO
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="transition-all duration-100 h-screen grid place-items-center Gelion-Regular text-[#606161] ">
      <div className="w-full px-4">
        <div className="text-center space-y-4 mb-8">
          <img
            src={"/logo.svg"}
            className="mx-auto"
            width="50px"
            alt="bird logo"
          />
          <h1 className="text-4xl Gelion-Semi-Bold text-[#131313]">Sign in</h1>
          <p className="max-w-[17rem] mx-auto text-lg">
            Welcome back! Enter your email and password below to sign in.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="text-[#131313] max-w-lg mx-auto"
        >
          <label className="block Gelion-Semi-Bold" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-lg border-[#9C9D9F] mt-2 mb-5"
            type="email"
            name="email"
            placeholder="Email"
            onChange={onChange}
          />

          <label className="block Gelion-Semi-Bold" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-lg border-[#9C9D9F] mt-2 "
            type="password"
            name="password"
            placeholder="Password"
            onChange={onChange}
          />

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <input
                className="rounded-md"
                type="checkbox"
                name="keepLogged"
                id="keepLogged"
                value="false"
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
            className="bg-[#4558ff] text-white w-full mt-5 rounded-lg py-3 Gelion-Semi-Bold cursor-pointer hover:brightness-90 active:outline active:outline-offset-4 active:outline-4 active:outline-[#4558ff]"
            type="submit"
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
