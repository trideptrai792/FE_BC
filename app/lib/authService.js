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
  if (data.user?.roles) {
    localStorage.setItem(ROLE_KEY, data.user.roles);
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
  async login(login, password) {
    const res = await axiosClient.post("/auth/login", { login, password });
    const data = res.data;
    saveAuthToStorage(data);
    return data;
  },

  async register(name, email, phone, password) {
    const res = await axiosClient.post("/auth/register", {
      name,
      email,
      phone,
      password,
    });
    const data = res.data;
    saveAuthToStorage(data);
    return data;
  },

  logout() {
    clearAuthFromStorage();
  },

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
