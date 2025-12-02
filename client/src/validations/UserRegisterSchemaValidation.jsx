import * as yup from "yup";

export const UserRegisterSchemaValidation = yup.object().shape({
  name: yup.string().required("Name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Not a Valid Email Format!!")
    .required("Email is Required.."),
  password: yup
    .string()
    .required("Password is Required..")
    .min(4, "Minimum 4 characters required..")
    .max(8, "Maximum 8 characters required.."),
  address: yup.string().required("Address is required"),
  phoneNumber: yup
    .string()
    .matches(/^\d+$/, "Phone must be digits only")
    .required("Phone number is required"),
  age: yup
    .number()
    .typeError("Age is required")
    .min(18, "Minimum age is 18")
    .required("Age is required"),
  gender: yup.string().required("Gender is required"),
  username: yup
  .string()
  .required("Username is required")
  .min(3, "At least 3 characters"),
});
