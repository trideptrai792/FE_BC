<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductSale;
use Illuminate\Http\Request;

class ProductSaleController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductSale::query()
            ->with('product:id,name,slug,thumbnail,price_buy')
            ->orderByDesc('date_begin');

        if ($request->filled('status')) {
            $query->where('status', (int) $request->input('status'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', (int) $request->input('product_id'));
        }

        $sales = $query->paginate(20);

        return response()->json([
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
                'last_page' => $sales->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'product_id'  => ['required', 'integer', 'exists:products,id'],
            'price_sale'  => ['required', 'numeric', 'min:0'],
            'date_begin'  => ['required', 'date'],
            'date_end'    => ['required', 'date', 'after_or_equal:date_begin'],
            'status'      => ['nullable', 'integer', 'in:0,1'],
        ]);

        $data['status'] = $data['status'] ?? 1;
        $data['created_by'] = $request->user()?->id ?? 1;

        $sale = ProductSale::create($data);

        return response()->json([
            'message' => 'Tạo khuyến mãi thành công',
            'data' => $sale->load('product:id,name,slug,thumbnail,price_buy'),
        ], 201);
    }

    public function update(Request $request, ProductSale $productSale)
    {
        $data = $request->validate([
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'product_id'  => ['sometimes', 'required', 'integer', 'exists:products,id'],
            'price_sale'  => ['sometimes', 'required', 'numeric', 'min:0'],
            'date_begin'  => ['sometimes', 'required', 'date'],
            'date_end'    => ['sometimes', 'required', 'date'],
            'status'      => ['nullable', 'integer', 'in:0,1'],
        ]);

        if (isset($data['date_begin'], $data['date_end']) && $data['date_end'] < $data['date_begin']) {
            return response()->json(['message' => 'date_end phải >= date_begin'], 422);
        }

        $data['updated_by'] = $request->user()?->id ?? null;

        $productSale->update($data);

        return response()->json([
            'message' => 'Cập nhật khuyến mãi thành công',
            'data' => $productSale->fresh()->load('product:id,name,slug,thumbnail,price_buy'),
        ]);
    }

    public function destroy(ProductSale $productSale)
    {
        $productSale->delete();

        return response()->json([
            'message' => 'Đã xóa khuyến mãi',
        ]);
    }
}

