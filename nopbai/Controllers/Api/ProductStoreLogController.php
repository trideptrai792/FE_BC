<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductStoreLog;
use Illuminate\Http\Request;

class ProductStoreLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductStoreLog::query()
            ->with('product:id,name,slug,thumbnail,price_buy')
            ->orderByDesc('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', (int) $request->input('product_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $logs = $query->paginate(20);

        $data = collect($logs->items())->map(function ($log) {
            $product = $log->product;

            return [
                'id' => $log->id,
                'product_id' => $log->product_id,
                'type' => $log->type,
                'qty' => $log->qty,
                'note' => $log->note,
                'user_id' => $log->user_id,
                'created_at' => $log->created_at,
                'product_name' => $product?->name,
                'product_slug' => $product?->slug,
                'product_thumbnail' => $product?->thumbnail ? asset($product->thumbnail) : null,
                'product_price' => $product?->price_buy,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }
}
