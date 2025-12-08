"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosClient from "../lib/axiosClient"; // app/posts → ../lib/axiosClient

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError("");

        // GET /api/posts
        const res = await axiosClient.get("/posts");
        const data = res.data;
        setPosts(data.data || []);
      } catch (e) {
        console.error(e);
        setError(
          e.response?.data?.message || e.message || "Lỗi khi tải bài viết"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Tin Tức &amp; Bài Viết
      </h1>

      {error && (
        <p className="mb-4 text-center text-red-600 text-sm">{error}</p>
      )}
      {loading && (
        <p className="mb-4 text-center text-gray-500 text-sm">
          Đang tải dữ liệu...
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4">
            {post.thumbnail && (
              <img
                src={post.thumbnail}
                className="w-full h-48 object-cover rounded"
                alt={post.title}
              />
            )}

            <h2 className="text-xl font-bold mt-4 line-clamp-2">
              {post.title}
            </h2>

            <p className="text-gray-600 line-clamp-2 mt-2">
              {post.excerpt}
            </p>

            <Link
              href={`/posts/${post.slug}`}
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Đọc thêm
            </Link>
          </div>
        ))}

        {!loading && !error && posts.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            Chưa có bài viết nào.
          </p>
        )}
      </div>
    </div>
  );
}
