<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    // CLIENT: GET /api/posts
    public function index()
    {
        $posts = Post::where('status', 1)
            ->latest()
            ->paginate(10);

        return PostResource::collection($posts);
    }

    // CLIENT: GET /api/posts/{slug}
    public function show($slug)
    {
        $post = Post::where('slug', $slug)->where('status', 1)->firstOrFail();
        return new PostResource($post);
    }

    // ADMIN: POST /api/posts
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'     => ['required', 'string', 'max:255'],
            'slug'      => ['nullable', 'string', 'max:255', 'unique:posts,slug'],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'excerpt'   => ['nullable', 'string'],
            'content'   => ['nullable', 'string'],
            'status'    => ['nullable', 'integer'],
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (!isset($data['status'])) {
            $data['status'] = 1;
        }

        $data['created_by'] = $request->user()?->id;

        $post = Post::create($data);

        return new PostResource($post);
    }

    // ADMIN: PUT /api/posts/{post}
    public function update(Request $request, Post $post)
    {
        $data = $request->validate([
            'title'     => ['sometimes', 'string', 'max:255'],
            'slug'      => ['sometimes', 'string', 'max:255', 'unique:posts,slug,' . $post->id],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'excerpt'   => ['nullable', 'string'],
            'content'   => ['nullable', 'string'],
            'status'    => ['nullable', 'integer'],
        ]);

        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $post->update($data);

        return new PostResource($post);
    }

    // ADMIN: DELETE /api/posts/{post}
    public function destroy(Post $post)
    {
        $post->delete();

        return response()->json([
            'message' => 'Xóa bài viết thành công',
        ]);
    }
}
