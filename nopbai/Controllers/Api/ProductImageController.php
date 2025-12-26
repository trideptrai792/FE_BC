<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    public function uploadImage(Request $request)
    {
        // validate file
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        // lưu vào storage/app/public/products
        $path = $request->file('image')->store('products', 'public');

        // tạo URL public: http://localhost:8000/storage/products/xxx.png
        $url = asset('storage/' . $path);

        return response()->json([
            'url' => $url,
        ]);
    }
}
