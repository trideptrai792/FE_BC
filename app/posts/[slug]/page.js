"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosClient from "../../lib/axiosClient"; // app/posts/[slug] → ../../lib/axiosClient

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axiosClient.get(`/posts/${slug}`);
        const data = res.data;
        setPost(data.data || data);
      } catch (e) {
        console.error(e);
        setError(
          e.response?.data?.message || e.message || "Không tải được bài viết"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <p className="p-6">Đang tải...</p>;
  if (error || !post)
    return <p className="p-6 text-red-600">{error || "Không tìm thấy bài viết"}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}
      <p className="text-gray-600 mb-6">{post.excerpt}</p>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
    </div>
  );
}
