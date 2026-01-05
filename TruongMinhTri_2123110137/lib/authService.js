"use client";

import axiosClient from "./axiosClient";

const TOKEN_KEY = "token";
const NAME_KEY = "displayName";
const ROLE_KEY = "role";

function saveAuthToStorage(data) {
  if (typeof window === "undefined") return;

  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  if (data.user?.name) {
    localStorage.setItem(NAME_KEY, data.user.name);
  }
  if (data.user?.role) {
    localStorage.setItem(ROLE_KEY, data.user.role);
  }
}

function clearAuthFromStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const name = localStorage.getItem(NAME_KEY);
  const role = localStorage.getItem(ROLE_KEY);
  if (!name && !role) return null;
  return { name, role };
}

const authService = {
  // Đăng nhập: POST /api/login (Laravel trả {token, user})
  async login(email, password) {
    const res = await axiosClient.post("/login", { email, password });
    const data = res.data;
    saveAuthToStorage(data);
    return data; // { message, token, user }
  },

  // Đăng ký: POST /api/register (đúng format bạn đã viết ở BE)
  async register(name, email, password) {
    const res = await axiosClient.post("/register", {
      name,
      email,
      password,
    });
    const data = res.data;
    saveAuthToStorage(data);
    return data; // { message, token, user }
  },

  // Đăng xuất phía FE (xoá token local)
  logout() {
    clearAuthFromStorage();
  },

  // Helpers
  getToken,
  getCurrentUser,
  isLoggedIn() {
    return !!getToken();
  },
  isAdmin() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ROLE_KEY) === "admin";
  },
};

export default authService;
