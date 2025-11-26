import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import logo from "../assets/LogoBg.png";
// If you later add your own schema and slice, you can re-enable these:
// import { UserSchemaValidation } from "../validations/userSchemaValidation";
// import { getUser } from "../features/UserSlice";
// import { useDispatch, useSelector } from "react-redux";

// TEMP: simple local schema so the page works
const UserSchemaValidation = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Min 6 characters").required("Password is required"),
});

const Login = () => {
  // UseStates (same style as your reference)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const dispatch = useDispatch();
  // const user = useSelector((state) => state.users.user);
  // const isSuccess = useSelector((state) => state.users.isSuccess);
  // const isError = useSelector((state) => state.users.isError);
  const navigate = useNavigate();

  // Validation configuration
  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({ resolver: yupResolver(UserSchemaValidation) });

  const validate = () => {
    const data = {
      email,
      password,
    };

    console.log("LOGIN DATA:", data);
    // Later you can dispatch(getUser(data)) here

    // TEMP: navigate to home on "success"
    navigate("/home");
  };

  // If you re-enable Redux login, you can re-enable this effect
  /*
  useEffect(() => {
    if (user && isSuccess) navigate("/home");
    if (isError) navigate("/");
  }, [user, isSuccess, isError, navigate]);
  */

  return (
    <div className="page login-bg login-page">
      {/* top bar like landing/register */}
      <header className="top-bar">
        <div className="brand-left">
          <img src={logo} alt="Pulse logo" className="brand-logo" />
          <span className="brand-title">PULSE</span>
        </div>

        
      </header>

      {/* center login card */}
      <Container fluid className="login-container">
        <Row className="justify-content-center">
          <Col md="5">
            <h1 className="login-title text-center">LOGIN</h1>

            <form className="login-card">
              {/* EMAIL */}
              <FormGroup className="login-field">
                <Label className="login-label">EMAIL</Label>
                <input
                  {...register("email", {
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                  })}
                  type="email"
                  className="form-control login-input"
                />
                <p className="login-error">{errors.email?.message}</p>
              </FormGroup>

              {/* PASSWORD */}
              <FormGroup className="login-field">
                <Label className="login-label">PASSWORD</Label>
                <input
                  {...register("password", {
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                  })}
                  type="password"
                  className="form-control login-input"
                />
                <p className="login-error">{errors.password?.message}</p>
              </FormGroup>

              {/* LOGIN button */}
              <FormGroup>
                <Button
                  onClick={submitForm(validate)}
                  className="form-control login-submit"
                  color="dark"
                >
                  LOGIN
                </Button>
              </FormGroup>

              {/* Bottom links */}
              <FormGroup className="text-center login-bottom">
                <p className="login-bottom-text">
                  DONT HAVE AN ACCOUNT?{" "}
                  <Link to="/register" className="login-signup-link">
                    SIGN UP
                  </Link>
                </p>
                <p>
                  <Link to="/reset-password" className="login-forgot-link">
                    FORGET PASSWORD!
                  </Link>
                </p>
              </FormGroup>
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
