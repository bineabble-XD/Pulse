import React, { useState } from "react";
import { Container, Row, Col, FormGroup, Label, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";

import logo from "../assets/LogoBg.png";
import { UserRegisterSchemaValidation } from "../validations/UserRegisterSchemaValidation";
import { addUser } from "../features/PulseSlice";

const Registeration = () => {
  // UseStates – same style as your reference
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(UserRegisterSchemaValidation),
  });

  const validate = () => {
    const data = {
      fname: name,
      lname: lastName,
      email,
      password,
      address,
      phnum: phoneNumber,
      age,
      gender,
    };

    dispatch(addUser(data)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        navigate("/login");
      }
    });

  };

  return (
    <div className="page register-bg register-page">
      {/* top bar like landing page */}
      <header className="top-bar">
        <div className="brand-left">
          <img src={logo} alt="Pulse logo" className="brand-logo" />
          <span className="brand-title">PULSE</span>
        </div>

        <Link to="/login" className="login-link">
          LOG IN
        </Link>
      </header>

      {/* center registration card (design unchanged) */}
      <Container fluid className="register-container">
        <Row className="justify-content-center">
          <Col md="5">
            <h1 className="register-title text-center">REGISTERATION</h1>

            <form className="register-card">
              {/* NAME */}
              <FormGroup className="register-field">
                <Label className="register-label">NAME</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  {...register("name", {
                    value: name,
                    onChange: (e) => setName(e.target.value),
                  })}
                />
                <p className="register-error">{errors.name?.message}</p>
              </FormGroup>

              {/* LAST NAME */}
              <FormGroup className="register-field">
                <Label className="register-label">LAST NAME</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  {...register("lastName", {
                    value: lastName,
                    onChange: (e) => setLastName(e.target.value),
                  })}
                />
                <p className="register-error">
                  {errors.lastName?.message}
                </p>
              </FormGroup>

              {/* EMAIL */}
              <FormGroup className="register-field">
                <Label className="register-label">EMAIL</Label>
                <input
                  type="email"
                  className="form-control register-input"
                  {...register("email", {
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                  })}
                />
                <p className="register-error">{errors.email?.message}</p>
              </FormGroup>

              {/* PASSWORD */}
              <FormGroup className="register-field">
                <Label className="register-label">PASSWORD</Label>
                <input
                  type="password"
                  className="form-control register-input"
                  {...register("password", {
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                  })}
                />
                <p className="register-error">
                  {errors.password?.message}
                </p>
              </FormGroup>

              {/* ADDRESS */}
              <FormGroup className="register-field">
                <Label className="register-label">ADDRESS</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  {...register("address", {
                    value: address,
                    onChange: (e) => setAddress(e.target.value),
                  })}
                />
                <p className="register-error">
                  {errors.address?.message}
                </p>
              </FormGroup>

              {/* PHONE NUMBER */}
              <FormGroup className="register-field">
                <Label className="register-label">PHONE NUMBER</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  {...register("phoneNumber", {
                    value: phoneNumber,
                    onChange: (e) => setPhoneNumber(e.target.value),
                  })}
                />
                <p className="register-error">
                  {errors.phoneNumber?.message}
                </p>
              </FormGroup>

              {/* AGE */}
              <FormGroup className="register-field">
                <Label className="register-label">AGE</Label>
                <select
                  className="form-control register-input"
                  {...register("age", {
                    value: age,
                    onChange: (e) => setAge(e.target.value),
                  })}
                >
                  <option value="">Select age</option>
                  {Array.from({ length: 83 }, (_, i) => 18 + i).map(
                    (a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    )
                  )}
                </select>
                <p className="register-error">{errors.age?.message}</p>
              </FormGroup>

              {/* GENDER */}
              <FormGroup className="register-field">
                <Label className="register-label">GENDER</Label>
                <select
                  className="form-control register-input"
                  {...register("gender", {
                    value: gender,
                    onChange: (e) => setGender(e.target.value),
                  })}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <p className="register-error">
                  {errors.gender?.message}
                </p>
              </FormGroup>

              {/* SUBMIT BUTTON */}
              <FormGroup>
                <Button
                  onClick={submitForm(validate)}
                  className="form-control register-submit"
                  color="dark"
                >
                  SUBMIT
                </Button>
              </FormGroup>
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Registeration;
