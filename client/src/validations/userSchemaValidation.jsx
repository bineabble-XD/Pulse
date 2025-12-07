// validations/UserSchemaValidation.js
import * as yup from "yup";

export const UserSchemaValidation = yup.object().shape({
  email: yup
    .string()
    .email("Not a Valid Email Format!!")
    .required("Email is Required.."),
  password: yup
    .string()
    .required("Password is Required..")
    .min(8, "Minimum 8 characters required..")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Must contain at least one special character"
    ),
});
