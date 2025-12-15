import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Home from "./Home";

// ===== mocks =====
import axios from "axios";
vi.mock("axios");

vi.mock("../assets/3.png", () => ({ default: "bg.png" }));

vi.mock("./Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock("react-icons/fc", () => ({ FcLike: () => null }));
vi.mock("react-icons/fa", () => ({ FaRegCommentDots: () => null }));
vi.mock("react-icons/md", () => ({
  MdModeEdit: () => null,
  MdDeleteOutline: () => null,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));
import { useSelector } from "react-redux";

const makeFile = (name, type) => new File(["dummy"], name, { type });

beforeEach(() => {
  vi.clearAllMocks();

  useSelector.mockImplementation((sel) =>
    sel({
      users: {
        user: { _id: "u1", username: "abbas", profilePic: "" },
      },
    })
  );

  axios.get.mockResolvedValue({ data: [] });
});

describe("Home - Create Post (note + media)", () => {
  it("posts a NOTE only (no file) and adds it to feed", async () => {
    axios.post.mockResolvedValue({
      data: {
        post: {
          _id: "p1",
          text: "hello world",
          location: "",
          mediaUrl: null,
          mediaType: null,
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          author: { _id: "u1", username: "abbas", profilePic: "" },
        },
      },
    });

    render(<Home />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const [noteBox] = screen.getAllByPlaceholderText(/share a note/i);
    fireEvent.change(noteBox, { target: { value: "hello world" } });

    const [postBtn] = screen.getAllByRole("button", { name: /post/i });
    fireEvent.click(postBtn);

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(await screen.findByText("hello world")).toBeInTheDocument();
    expect(noteBox.value).toBe("");
  });

  it("posts with an IMAGE file and shows image in created post", async () => {
    axios.post.mockResolvedValue({
      data: {
        post: {
          _id: "p2",
          text: "pic post",
          location: "",
          mediaUrl: "https://cdn.test/my.png",
          mediaType: "image",
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          author: { _id: "u1", username: "abbas", profilePic: "" },
        },
      },
    });

    render(<Home />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const [noteBox] = screen.getAllByPlaceholderText(/share a note/i);
    fireEvent.change(noteBox, { target: { value: "pic post" } });

    // pick the FIRST file input
    const fileInputs = document.querySelectorAll(".home-file-input");
    const fileInput = fileInputs[0];

    const imgFile = makeFile("photo.png", "image/png");
    fireEvent.change(fileInput, { target: { files: [imgFile] } });

    const [postBtn] = screen.getAllByRole("button", { name: /post/i });
    fireEvent.click(postBtn);

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(await screen.findByText("pic post")).toBeInTheDocument();

    const imgs = await screen.findAllByAltText(/user upload/i);
    expect(imgs[0]).toHaveAttribute("src", "https://cdn.test/my.png");
  });

  it("posts with a VIDEO file and shows video in created post", async () => {
    axios.post.mockResolvedValue({
      data: {
        post: {
          _id: "p3",
          text: "vid post",
          location: "",
          mediaUrl: "https://cdn.test/my.mp4",
          mediaType: "video",
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          author: { _id: "u1", username: "abbas", profilePic: "" },
        },
      },
    });

    render(<Home />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const [noteBox] = screen.getAllByPlaceholderText(/share a note/i);
    fireEvent.change(noteBox, { target: { value: "vid post" } });

    const fileInputs = document.querySelectorAll(".home-file-input");
    const fileInput = fileInputs[0];

    const vidFile = makeFile("clip.mp4", "video/mp4");
    fireEvent.change(fileInput, { target: { files: [vidFile] } });

    const [postBtn] = screen.getAllByRole("button", { name: /post/i });
    fireEvent.click(postBtn);

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(await screen.findByText("vid post")).toBeInTheDocument();

    const videos = document.querySelectorAll("video.home-note-video");
    expect(videos.length).toBeGreaterThan(0);
    expect(videos[0].getAttribute("src")).toBe("https://cdn.test/my.mp4");
  });
});
