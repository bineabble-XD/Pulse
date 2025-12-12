import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Button,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";

import logo from "../assets/LogoBg.png";
import { UserSchemaValidation } from "../validations/userSchemaValidation";
import { getUser, resetStatus } from "../features/PulseSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const { user, isSuccess, isError, message, isLoading } = useSelector(
    (state) => state.users       
  );
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetStatus());
  }, [dispatch]);

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(UserSchemaValidation),
  });

  const validate = () => {
    const data = { email, password };
    dispatch(getUser(data));
  };

useEffect(() => {
  if (user && isSuccess) {
    if (user.role === "admin" || user.isAdmin) {
      navigate("/admin");       
    } else {
      navigate("/home");      
    }

    dispatch(resetStatus());
  }
}, [user, isSuccess, navigate, dispatch]);


  return (
    <div className="page login-bg login-page">
      <header className="top-bar">
        <div className="brand-left">
          <img src={logo} alt="Pulse logo" className="brand-logo" />
          <span className="brand-title">PULSE</span>
        </div>
      </header>

      <Container fluid className="login-container">
        <Row className="justify-content-center">
          <Col md="5">
            <h1 className="login-title text-center">LOGIN</h1>

            <form className="login-card">
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

              {isError && message && (
                <p className="login-error" style={{ marginTop: "0.5rem" }}>
                  {message}
                </p>
              )}

              <FormGroup>
                <Button
                  onClick={submitForm(validate)}
                  className="form-control login-submit"
                  color="dark"
                  disabled={isLoading}
                >
                  {isLoading ? "LOADING..." : "LOGIN"}
                </Button>
              </FormGroup>

              <FormGroup className="text-center login-bottom">
                <p className="login-bottom-text">
                  DONT HAVE AN ACCOUNT?{" "}
                  <Link to="/register" className="login-signup-link">
                    SIGN UP
                  </Link>
                </p>
                <p>
                  <Link
                    to="/reset-password"
                    className="login-forgot-link"
                  >
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
