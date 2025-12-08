"use client";

import axiosClient from "./axiosClient"; // đã có sẵn

// Xây tree từ mảng phẳng (dựa vào parent_id)
function buildMenuTree(items) {
  const map = {};
  const roots = [];

  items.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  items.forEach((item) => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  // sort theo sort_order trong cùng 1 cấp
  const sortTree = (nodes) => {
    nodes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}

async function fetchMenusByPosition(position) {
  const res = await axiosClient.get("/menus", {
    params: { position },
  });

  const raw = res.data.data || res.data || [];
  return buildMenuTree(raw);
}

const menuService = {
  fetchMenusByPosition,
};

export default menuService;
export { buildMenuTree };
