import API from "./api";

// =========================
// LOGIN
// =========================

export const loginAdmin = async (email, password) => {
  const response = await API.post("/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });

  return response.data;
};

// =========================
// CURRENT ADMIN
// =========================

export const getCurrentAdmin = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

// =========================
// LOGOUT
// =========================

export const logoutAdmin = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("admin");
};