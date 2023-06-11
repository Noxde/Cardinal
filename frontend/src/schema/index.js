import * as Yup from "yup";

export const LoginSchema = Yup.object({
  id: Yup.string().required("Required."),
  password: Yup.string()
    .required("Enter your account password.")
    .matches(/^(?=.*?[A-Z])/, "Password includes an uppercase letter.")
    .matches(/(?=.*?[0-9])/, "Password includes at least one number.")
    .matches(/(?=.*?[#?!@$%^&*-])/, "Password includes a special character.")
    .min(8, "Password is at least 8 characters long."),
});

export const SignUpSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email.")
    .required("Email can't be empty."),
  username: Yup.string()
    .required("Required.")
    .min(3, "Must be at least 3 characters long."),
  password: Yup.string()
    .required("Password can't be empty.")
    .matches(/^(?=.*?[A-Z])/, "Password must include an uppercase letter.")
    .matches(/(?=.*?[0-9])/, "Password must include at least one number.")
    .matches(
      /(?=.*?[#?!@$%^&*-])/,
      "Password must include a special character."
    )
    .min(8, "Password must be at least 8 characters long."),
  match: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords don't match.")
    .required("Required."),
});
