<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductStore;
use App\Models\ProductStoreLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    
    
    public function index(Request $request)
    {   
        $category_slug = $request->input('category');

        $query = Product::query()
            ->where('status', 1);

        if ($category_slug) {
            $category = Category::where('slug', $category_slug)->firstOrFail();
            $query->where('category_id', $category->id);
        }

        $products = $query
            ->with([
                'category',
                'images',
                'productAttributes.attribute',
            ])
            ->withSum(['stores' => function ($q) {
                $q->where('status', 1);
            }], 'qty')
            ->latest()
            ->paginate(24);

        $this->applySalePricing($products->getCollection());

        return ProductResource::collection($products);
    }

    /**
     * API: sản phẩm mới (còn hàng) cho FE
     */
    public function productNew(Request $request)
    {
        $limit = (int) ($request->input('limit') ?? 20);
        // Ép dùng múi giờ Việt Nam để so sánh khuyến mãi
        $now   = now('Asia/Ho_Chi_Minh');

        $productStore = ProductStore::query()
            ->selectRaw('product_id, SUM(qty) AS product_qty')
            ->where('status', 1)
            ->groupBy('product_id');

        $productSale = DB::table('product_sales')
            ->select('product_id', 'price_sale')
            ->where('status', 1)
            ->where('date_begin', '<=', $now)
            ->where('date_end', '>=', $now);

        $products = Product::query()
            ->joinSub($productStore, 'ps', function ($join) {
                $join->on('ps.product_id', '=', 'products.id')
                    ->where('ps.product_qty', '>', 0);
            })
            ->leftJoinSub($productSale, 'psale', function ($join) {
                $join->on('psale.product_id', '=', 'products.id');
            })
            ->select([
                'products.*',
                'ps.product_qty',
                'psale.price_sale',
            ])
            ->with('images')
            ->orderByDesc('products.created_at')
            ->limit($limit)
            ->get()
            ->map(function ($product) {
                return [
                    'id'            => $product->id,
                    'name'          => $product->name,
                    'slug'          => $product->slug,
                    'thumbnail'     => asset($product->thumbnail),
                    'stock'         => (int) $product->product_qty,
                    'price_origin'  => (float) $product->price_buy,
                    'price_sale'    => $product->price_sale ? (float) $product->price_sale : null,
                    'price_display' => $product->price_sale ? (float) $product->price_sale : (float) $product->price_buy,
                    'images'        => $product->images->map(fn ($img) => asset($img->image)),
                ];
            });

        return response()->json([
            'data' => $products,
        ]);
    }

    public function show($slug)
    {
        $product = Product::with([
                'category',
                'images',
                'productAttributes.attribute',
            ])
            ->withSum(['stores' => function ($q) {
                $q->where('status', 1);
            }], 'qty')
            ->where('slug', $slug)
            ->firstOrFail();

        $now = now('Asia/Ho_Chi_Minh');
        $sale = DB::table('product_sales')
            ->select('price_sale')
            ->where('product_id', $product->id)
            ->where('status', 1)
            ->where('date_begin', '<=', $now)
            ->where('date_end', '>=', $now)
            ->orderByDesc('date_begin')
            ->first();

        if ($sale) {
            $product->price_sale = (float) $sale->price_sale;
            $product->price_display = (float) $sale->price_sale;
        } else {
            $product->price_sale = null;
            $product->price_display = (float) $product->price_buy;
        }
        $product->price_origin = (float) $product->price_buy;

        return new ProductResource($product);
    }

    // ========== ADMIN: THÊM MỚI ==========
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255'],
            'price'       => ['required', 'numeric'],
            'stock'       => ['nullable', 'integer', 'min:0'],
            'thumbnail'   => ['nullable', 'string', 'max:255'],
            'content'     => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status'      => ['nullable', 'integer'],
        ]);

        $stockInput = array_key_exists('stock', $data) ? $data['stock'] : null;
        unset($data['stock']);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $data['price_buy'] = $data['price'];
        unset($data['price']);

        $product = Product::create($data);

        if ($stockInput !== null) {
            $this->upsertProductStoreQty(
                productId: $product->id,
                qty: (int) $stockInput,
                priceRoot: (float) ($product->price_buy ?? 0),
                userId: $request->user()?->id ?? 1
            );
        }

        $this->syncProductStockCache($product->id);

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201);
    }

    // ========== ADMIN: CẬP NHẬT ==========
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255'],
            'price'       => ['required', 'numeric'],
            'stock'       => ['nullable', 'integer', 'min:0'],
            'thumbnail'   => ['nullable', 'string', 'max:255'],
            'content'     => ['nullable', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'status'      => ['nullable', 'integer'],
        ]);

        $stockInput = array_key_exists('stock', $data) ? $data['stock'] : null;
        unset($data['stock']);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $data['price_buy'] = $data['price'];
        unset($data['price']);

        $product->update($data);

        if ($stockInput !== null) {
            $this->upsertProductStoreQty(
                productId: $product->id,
                qty: (int) $stockInput,
                priceRoot: (float) ($product->price_buy ?? 0),
                userId: $request->user()?->id ?? 1
            );
        }

        $this->syncProductStockCache($product->id);

        return new ProductResource($product->fresh());
    }

    // ========== ADMIN: XÓA ==========
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Xóa sản phẩm thành công',
        ]);
    }

    protected function upsertProductStoreQty(int $productId, int $qty, float $priceRoot, int $userId): void
    {
        $store = ProductStore::query()
            ->where('product_id', $productId)
            ->where('status', 1)
            ->orderByDesc('id')
            ->first();

        if ($store) {
            $oldQty = (int) $store->qty;
            $store->update([
                'qty' => $qty,
                'price_root' => $priceRoot,
                'updated_by' => $userId,
            ]);
            $this->logStockChange($productId, $qty - $oldQty, $userId, 'Cập nhật kho');
            return;
        }

        ProductStore::create([
            'product_id' => $productId,
            'qty' => $qty,
            'price_root' => $priceRoot,
            'status' => 1,
            'created_by' => $userId,
        ]);
        $this->logStockChange($productId, $qty, $userId, 'Nhập kho');
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

    protected function applySalePricing($products): void
    {
        if ($products->isEmpty()) {
            return;
        }

        $now = now('Asia/Ho_Chi_Minh');
        $productIds = $products->pluck('id')->all();

        $sales = DB::table('product_sales')
            ->select('product_id', 'price_sale', 'date_begin')
            ->whereIn('product_id', $productIds)
            ->where('status', 1)
            ->where('date_begin', '<=', $now)
            ->where('date_end', '>=', $now)
            ->orderByDesc('date_begin')
            ->get()
            ->unique('product_id')
            ->keyBy('product_id');

        foreach ($products as $product) {
            $product->price_origin = (float) $product->price_buy;

            if ($sales->has($product->id)) {
                $priceSale = (float) $sales[$product->id]->price_sale;
                $product->price_sale = $priceSale;
                $product->price_display = $priceSale;
            } else {
                $product->price_sale = null;
                $product->price_display = (float) $product->price_buy;
            }
        }
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
