// src/components/Registeration.jsx
import React, { useState } from "react";
import { FormGroup, Label, Button, Form } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import axios from "axios";

import logo from "../assets/LogoBg.png";
import { UserRegisterSchemaValidation } from "../validations/UserRegisterSchemaValidation";
import { addUser } from "../features/PulseSlice";

const API_BASE = "http://localhost:6969";

const Registeration = () => {
  // form states
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [usernameStatus, setUsernameStatus] = useState(null); // null | "checking" | "ok" | "taken"

  // password validation state
  const [passwordValidations, setPasswordValidations] = useState({
    lower: false,
    upper: false,
    number: false,
    special: false,
    length: false,
  });

  const [showPasswordHints, setShowPasswordHints] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(UserRegisterSchemaValidation),
  });

  const validatePassword = (value) => {
    setPasswordValidations({
      lower: /[a-z]/.test(value),
      upper: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
      length: value.length >= 8,
    });
  };

  const checkUsername = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setUsernameStatus(null);
      return;
    }

    try {
      setUsernameStatus("checking");
      const res = await axios.get(`${API_BASE}/check-username`, {
        params: { username: trimmed },
      });

      if (res.data.available) {
        setUsernameStatus("ok");
      } else {
        setUsernameStatus("taken");
      }
    } catch (err) {
      console.error("Username check error:", err);
      setUsernameStatus("taken");
    }
  };

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
      username,
    };

    if (usernameStatus === "taken") {
      alert("Username is already taken. Please choose another one.");
      return;
    }

    dispatch(addUser(data)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        navigate("/login");
      } else {
        alert(res.payload?.message || "Registration failed");
      }
    });
  };

  return (
    <div className="page register-bg register-page">
      {/* Top bar */}
      <header className="top-bar">
        <div className="brand-left">
          <img src={logo} alt="Pulse logo" className="brand-logo" />
          <span className="brand-title">PULSE</span>
        </div>

        <Link to="/login" className="login-link">
          LOG IN
        </Link>
      </header>

      {/* Main centered content */}
      <main className="register-main">
        <h1 className="register-title text-center">REGISTRATION</h1>

        {/* Big centered card */}
        <Form className="register-card" onSubmit={submitForm(validate)}>
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
            <p className="register-error">{errors.lastName?.message}</p>
          </FormGroup>

          {/* USERNAME */}
          <FormGroup className="register-field">
            <Label className="register-label">USERNAME</Label>
            <input
              type="text"
              className="form-control register-input"
              {...register("username", {
                value: username,
                onChange: (e) => setUsername(e.target.value),
              })}
              onBlur={(e) => checkUsername(e.target.value)}
            />
            <p className="register-error">{errors.username?.message}</p>

            {usernameStatus === "checking" && (
              <small style={{ color: "#cccccc" }}>Checking username...</small>
            )}
            {usernameStatus === "taken" && (
              <small style={{ color: "#ff4d4d" }}>
                Username already taken
              </small>
            )}
            {usernameStatus === "ok" && (
              <small style={{ color: "#4dff88" }}>
                Username is available
              </small>
            )}
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
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-control register-input"
                {...register("password", {
                  value: password,
                  onChange: (e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  },
                })}
                onFocus={() => setShowPasswordHints(true)}
                onBlur={() => setShowPasswordHints(false)}
              />

              {showPasswordHints && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "6px",
                    padding: "8px 10px",
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    fontSize: "12px",
                    zIndex: 10,
                    minWidth: "250px",
                  }}
                >
                  <strong style={{ fontSize: "11px" }}>
                    PASSWORD MUST CONTAIN:
                  </strong>
                  <ul
                    style={{
                      listStyle: "none",
                      paddingLeft: 0,
                      marginTop: "6px",
                      marginBottom: 0,
                    }}
                  >
                    <li
                      style={{
                        color: passwordValidations.lower ? "green" : "red",
                      }}
                    >
                      {passwordValidations.lower ? "✔" : "✘"} At least one
                      lowercase letter
                    </li>
                    <li
                      style={{
                        color: passwordValidations.upper ? "green" : "red",
                      }}
                    >
                      {passwordValidations.upper ? "✔" : "✘"} At least one
                      uppercase letter
                    </li>
                    <li
                      style={{
                        color: passwordValidations.number ? "green" : "red",
                      }}
                    >
                      {passwordValidations.number ? "✔" : "✘"} At least one
                      number
                    </li>
                    <li
                      style={{
                        color: passwordValidations.special ? "green" : "red",
                      }}
                    >
                      {passwordValidations.special ? "✔" : "✘"} At least one
                      special character
                    </li>
                    <li
                      style={{
                        color: passwordValidations.length ? "green" : "red",
                      }}
                    >
                      {passwordValidations.length ? "✔" : "✘"} Minimum 8
                      characters
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <p className="register-error">{errors.password?.message}</p>
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
            <p className="register-error">{errors.address?.message}</p>
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
            <p className="register-error">{errors.phoneNumber?.message}</p>
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
              {Array.from({ length: 83 }, (_, i) => 18 + i).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
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
            <p className="register-error">{errors.gender?.message}</p>
          </FormGroup>

          {/* SUBMIT */}
          <FormGroup>
            <Button
              type="submit"
              className="form-control register-submit"
              color="dark"
            >
              SUBMIT
            </Button>
          </FormGroup>
        </Form>
      </main>
    </div>
  );
};

export default Registeration;
