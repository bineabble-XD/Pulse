import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Button,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/LogoBg.png";

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

  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();

    const data = {
      name,
      lastName,
      email,
      password,
      address,
      phoneNumber,
      age,
      gender,
    };

    console.log("REGISTER DATA:", data);
    // TODO: send data to backend / Redux here

    // example: go to home after registering
    navigate("/home");
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

      {/* center registration card */}
      <Container fluid className="register-container">
        <Row className="justify-content-center">
          <Col md="5">
            <h1 className="register-title text-center">REGISTERATION</h1>

            <form className="register-card" onSubmit={onSubmit}>
              {/* NAME */}
              <FormGroup className="register-field">
                <Label className="register-label">NAME</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormGroup>

              {/* LAST NAME */}
              <FormGroup className="register-field">
                <Label className="register-label">LAST NAME</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormGroup>

              {/* EMAIL */}
              <FormGroup className="register-field">
                <Label className="register-label">EMAIL</Label>
                <input
                  type="email"
                  className="form-control register-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>

              {/* PASSWORD */}
              <FormGroup className="register-field">
                <Label className="register-label">PASSWORD</Label>
                <input
                  type="password"
                  className="form-control register-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>

              {/* ADDRESS */}
              <FormGroup className="register-field">
                <Label className="register-label">ADDRESS</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </FormGroup>

              {/* PHONE NUMBER */}
              <FormGroup className="register-field">
                <Label className="register-label">PHONE NUMBER</Label>
                <input
                  type="text"
                  className="form-control register-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </FormGroup>

              {/* AGE */}
              <FormGroup className="register-field">
                <Label className="register-label">AGE</Label>
                <select
                  className="form-control register-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                >
                  <option value="">Select age</option>
                  {Array.from({ length: 83 }, (_, i) => 18 + i).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </FormGroup>

              {/* GENDER */}
              <FormGroup className="register-field">
                <Label className="register-label">GENDER</Label>
                <select
                  className="form-control register-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </FormGroup>

              {/* SUBMIT BUTTON */}
              <FormGroup>
                <Button
                  type="submit"
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
