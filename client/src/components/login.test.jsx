import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import Login from "./Login";


import { useDispatch, useSelector } from "react-redux";
vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

import { MemoryRouter, useNavigate } from "react-router-dom";
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

import { getUser, resetStatus } from "../features/PulseSlice";
vi.mock("../features/PulseSlice", () => ({
  getUser: vi.fn((data) => ({ type: "users/getUser", payload: data })),
  resetStatus: vi.fn(() => ({ type: "users/resetStatus" })),
}));

vi.mock("../validations/userSchemaValidation", () => ({
  UserSchemaValidation: {},
}));

vi.mock("@hookform/resolvers/yup", () => ({
  yupResolver: () => () => ({ values: {}, errors: {} }),
}));

vi.mock("../assets/LogoBg.png", () => ({
  default: "logo.png",
}));


const makeState = (overrides = {}) => ({
  user: null,
  isSuccess: false,
  isError: false,
  message: "",
  isLoading: false,
  ...overrides,
});

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  useDispatch.mockReturnValue(mockDispatch);
  useSelector.mockImplementation((selector) =>
    selector({ users: makeState() })
  );
  useNavigate.mockReturnValue(mockNavigate);
});

const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};


describe("Pulse Login Component", () => {
  it("renders at least one text input and a login button", () => {
    renderWithRouter(<Login />);

    const textInputs = screen.getAllByRole("textbox");
    const loginButtons = screen.getAllByRole("button", { name: /login/i });

    expect(textInputs.length).toBeGreaterThanOrEqual(1);
    expect(loginButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("dispatches getUser when form is submitted with email filled", async () => {
    renderWithRouter(<Login />);

    const [emailInput] = screen.getAllByRole("textbox");

    const [loginButton] = screen.getAllByRole("button", {
      name: /login/i,
    });

    fireEvent.change(emailInput, {
      target: { value: "user@example.com" },
    });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(getUser).toHaveBeenCalled();

      const firstCallArg = getUser.mock.calls[0][0];
      expect(firstCallArg.email).toBe("user@example.com");
    });
  });

  it("shows backend error message when isError & message from Redux", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        users: makeState({
          isError: true,
          message: "Invalid credentials",
        }),
      })
    );

    renderWithRouter(<Login />);

    expect(
      screen.getByText(/invalid credentials/i)
    ).toBeInTheDocument();
  });

  it("shows LOADING... and disables button when isLoading is true", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        users: makeState({
          isLoading: true,
        }),
      })
    );

    renderWithRouter(<Login />);

    const [button] = screen.getAllByRole("button", {
      name: /loading.../i,
    });

    expect(button).toBeDisabled();
  });

  it("navigates to /admin when user is admin and isSuccess is true", async () => {
    useSelector.mockImplementation((selector) =>
      selector({
        users: makeState({
          user: { role: "admin", isAdmin: true },
          isSuccess: true,
        }),
      })
    );

    renderWithRouter(<Login />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });

    expect(resetStatus).toHaveBeenCalled();
  });

  it("navigates to /home when user is normal and isSuccess is true", async () => {
    useSelector.mockImplementation((selector) =>
      selector({
        users: makeState({
          user: { role: "user", isAdmin: false },
          isSuccess: true,
        }),
      })
    );

    renderWithRouter(<Login />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home");
    });

    expect(resetStatus).toHaveBeenCalled();
  });
});
