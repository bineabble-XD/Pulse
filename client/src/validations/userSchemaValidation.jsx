import * as yup from "yup";

export const UserSchemaValidation = yup.object().shape({
  email: yup
    .string()
    .email("Not a Valid Email Format!!")
    .required("Email is Required.."),
  password: yup
    .string()
    .required("Password is Required..")
    .min(4, "Minimum 4 characters required..")
    .max(8, "Maximum 8 characters required.."),
});
