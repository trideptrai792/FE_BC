"use client";

import axiosClient from "./axiosClient";

const TOKEN_KEY = "token";
const NAME_KEY = "displayName";
const ROLE_KEY = "role";

async function handleLoginSuccess(token, roleFromQuery = "customer") {
  if (typeof window === "undefined") {
    return { roles: roleFromQuery };
  }

  // Lưu token trước, để axiosClient / auth.me dùng được
  localStorage.setItem(TOKEN_KEY, token);

  try {
    // Gọi BE để lấy thông tin user từ token
    const res = await axiosClient.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = res.data.user ?? res.data;

    if (user?.name) {
      localStorage.setItem(NAME_KEY, user.name);
    }
    if (user?.roles) {
      localStorage.setItem(ROLE_KEY, user.roles);
    } else {
      localStorage.setItem(ROLE_KEY, roleFromQuery);
    }

    return user;
  } catch (e) {
    console.error("handleLoginSuccess error:", e);

    // Nếu gọi /auth/me fail, vẫn lưu role tạm từ query
    if (roleFromQuery) {
      localStorage.setItem(ROLE_KEY, roleFromQuery);
    }

    return { roles: roleFromQuery };
  }
}

const loginSuccessService = {
  handleLoginSuccess,
};

export default loginSuccessService;
