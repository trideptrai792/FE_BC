<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        $categories = Category::orderBy('id')->get();

        return response()->json([
            'data' => $categories,
        ]);
    }
    public function show($slug)
{
    $category = \App\Models\Category::where('slug', $slug)->first();

    if (!$category) {
        return response()->json([
            "message" => "Category not found",
            "data" => null
        ], 404);
    }

    return response()->json([
        "data" => $category
    ], 200);
}

    

    // POST /api/categories  (THÊM)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'   => 'required|string|max:255',
            'slug'   => 'required|string|max:255|unique:categories,slug',
            'status' => 'nullable|in:0,1',
        ]);

        if (!isset($data['status'])) {
            $data['status'] = 1;
        }

        $category = Category::create($data);

        return response()->json([
            'data' => $category,
        ], 201);
    }

    // PUT /api/categories/{category}  (SỬA)
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'   => 'sometimes|required|string|max:255',
            'slug'   => 'sometimes|required|string|max:255|unique:categories,slug,' . $category->id,
            'status' => 'nullable|in:0,1',
        ]);

        $category->update($data);

        return response()->json([
            'data' => $category,
        ]);
    }

    // DELETE /api/categories/{category}  (XÓA)
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'message' => 'Deleted',
        ], 204);
    }
}
