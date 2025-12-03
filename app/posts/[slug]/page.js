"use client";

import { use, useEffect, useState } from "react";

export default function PostDetail({ params }) {
  // params là Promise → dùng React.use() để lấy slug
  const { slug } = use(params);

  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/posts/${slug}`)
      .then((res) => res.json())
      .then((data) => setPost(data.data || data || null));
  }, [slug]);

  if (!post)
    return <p className="text-center mt-10">Đang tải bài viết...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <img
        src={post.thumbnail}
        className="w-full h-80 object-cover rounded mb-6"
        alt={post.title}
      />

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      <p className="text-gray-500 mb-6">
        Đăng ngày: {new Date(post.created_at).toLocaleDateString()}
      </p>

      <div
        className="prose prose-lg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      ></div>
    </div>
  );
}
