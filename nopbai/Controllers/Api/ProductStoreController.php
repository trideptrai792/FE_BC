<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductStore;
use App\Models\ProductStoreLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ProductStoreController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductStore::query()
            ->with([
                'product:id,name,slug,thumbnail,price_buy',
            ])
            ->orderByDesc('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', (int) $request->input('product_id'));
        }

        $stores = $query->paginate(20);

        return response()->json([
            'data' => $stores->items(),
            'meta' => [
                'current_page' => $stores->currentPage(),
                'per_page' => $stores->perPage(),
                'total' => $stores->total(),
                'last_page' => $stores->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'price_root' => ['nullable', 'numeric'],
            'qty' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'integer', 'in:0,1'],
        ]);

        $product = Product::findOrFail($data['product_id']);

        $data['price_root'] = $data['price_root'] ?? $product->price_buy ?? 0;
        $data['status'] = $data['status'] ?? 1;
        $data['created_by'] = $request->user()?->id ?? 1;

        $store = ProductStore::create($data);
        $this->logStockChange(
            productId: $store->product_id,
            qtyChange: (int) $store->qty,
            userId: $data['created_by'],
            note: 'Nhập kho'
        );

        $this->syncProductStockCache($product->id);

        return response()->json([
            'message' => 'Tạo tồn kho thành công',
            'data' => $store->load('product:id,name,slug,thumbnail,price_buy'),
        ], 201);
    }

    public function update(Request $request, ProductStore $productStore)
    {
        $data = $request->validate([
            'price_root' => ['nullable', 'numeric'],
            'qty' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'integer', 'in:0,1'],
        ]);

        if (array_key_exists('qty', $data) && $data['qty'] === null) {
            unset($data['qty']);
        }

        $oldQty = $productStore->qty;
        $data['updated_by'] = $request->user()?->id;

        $productStore->update($data);
        if (array_key_exists('qty', $data)) {
            $delta = (int) $productStore->qty - (int) $oldQty;
            if ($delta !== 0) {
                $this->logStockChange(
                    productId: $productStore->product_id,
                    qtyChange: $delta,
                    userId: $data['updated_by'],
                    note: 'Cập nhật kho'
                );
            }
        }

        $this->syncProductStockCache($productStore->product_id);

        return response()->json([
            'message' => 'Cập nhật tồn kho thành công',
            'data' => $productStore->fresh()->load('product:id,name,slug,thumbnail,price_buy'),
        ]);
    }

    public function destroy(ProductStore $productStore)
    {
        $productId = $productStore->product_id;
        $qty = (int) $productStore->qty;
        $userId = auth()->user()?->id;
        $productStore->delete();

        if ($qty > 0) {
            $this->logStockChange(
                productId: $productId,
                qtyChange: -$qty,
                userId: $userId,
                note: 'Xóa tồn kho'
            );
        }
        $this->syncProductStockCache($productId);

        return response()->json([
            'message' => 'Xóa tồn kho thành công',
        ]);
    }

    protected function syncProductStockCache(int $productId): void
    {
        if (!Schema::hasColumn('products', 'stock')) {
            return;
        }

        $stock = (int) ProductStore::query()
            ->where('product_id', $productId)
            ->where('status', 1)
            ->sum('qty');

        Product::query()
            ->whereKey($productId)
            ->update(['stock' => $stock]);
    }

    protected function logStockChange(int $productId, int $qtyChange, ?int $userId, ?string $note = null): void
    {
        if ($qtyChange === 0) {
            return;
        }

        ProductStoreLog::create([
            'product_id' => $productId,
            'type' => $qtyChange > 0 ? 'import' : 'export',
            'qty' => abs($qtyChange),
            'note' => $note,
            'user_id' => $userId,
        ]);
    }
}
