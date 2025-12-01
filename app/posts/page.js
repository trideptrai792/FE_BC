"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.data || []));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Tin Tức & Bài Viết</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4">
            <img
              src={post.thumbnail}
              className="w-full h-48 object-cover rounded"
            />

            <h2 className="text-xl font-bold mt-4">{post.title}</h2>

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
      </div>
    </div>
  );
}
