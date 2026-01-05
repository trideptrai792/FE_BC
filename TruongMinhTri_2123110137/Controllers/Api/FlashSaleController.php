<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Http\Request;

class FlashSaleController extends Controller
{
    // ==========================
    // API PUBLIC CHO FE HOME
    // GET /api/flash-sale
    // ==========================
    public function index(Request $request)
    {
        $now = now();

        $items = FlashSale::with('product')
            ->where('status', 1)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', $now);
            })
            ->orderBy('end_at')
            ->orderBy('sort_order')
            ->get();

        $data = $items->map(function (FlashSale $item) {
            $p = $item->product;
            if (!$p) return null;

            return [
                'id'             => $item->id,
                'product_id'     => $p->id,
                'name'           => $p->name,
                'thumbnail'      => asset($p->thumbnail),
                'price'          => number_format($item->flash_price, 0, ',', '.') . 'đ',
                'old_price'      => $p->price_buy
                    ? number_format($p->price_buy, 0, ',', '.') . 'đ'
                    : null,
                'sold'           => $item->sold . ' đã bán',
                'discount_label' => $item->discount_label,
                'badge_left'     => $item->badge_left,
                'badge_right'    => $item->badge_right,
                'benefit_1'      => $item->benefit_1,
                'benefit_2'      => $item->benefit_2,
                'end_time'       => $item->end_at ? $item->end_at->toIso8601String() : null,
            ];
        })->filter()->values();

        $globalEnd = $items->min('end_at');

        return response()->json([
            'data'     => $data,
            'end_time' => $globalEnd ? $globalEnd->toIso8601String() : null,
        ]);
    }

    // ==========================
    // ADMIN: LIST FLASH SALE
    // GET /api/admin/flash-sales
    // ==========================
    public function adminIndex(Request $request)
    {
        try {
            $items = FlashSale::with('product')
                ->orderByDesc('id')
                ->get();

            $data = $items->map(function (FlashSale $item) {
                $p = $item->product;

                return [
                    'id'               => $item->id,
                    'product_id'       => $item->product_id,
                    'product_name'     => $p ? $p->name : null,
                    'flash_price'      => $item->flash_price,
                    'discount_percent' => $item->discount_percent,
                    'sold'             => $item->sold,
                    'discount_label'   => $item->discount_label,
                    'badge_left'       => $item->badge_left,
                    'badge_right'      => $item->badge_right,
                    'benefit_1'        => $item->benefit_1,
                    'benefit_2'        => $item->benefit_2,
                    'start_at'         => $item->start_at ? $item->start_at->toIso8601String() : null,
                    'end_at'           => $item->end_at ? $item->end_at->toIso8601String() : null,
                    'status'           => $item->status,
                    'sort_order'       => $item->sort_order,
                ];
            });

            return response()->json([
                'data' => $data,
            ]);
        } catch (\Throwable $e) {
            // Đừng trả HTML nữa, trả JSON để FE đọc được message
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ==========================
    // ADMIN: TẠO FLASH SALE
    // POST /api/admin/flash-sales
    // ==========================
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'product_id'       => ['required', 'integer', 'exists:products,id'],
                'flash_price'      => ['required', 'numeric'],
                'discount_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
                'sold'             => ['nullable', 'integer', 'min:0'],
                'discount_label'   => ['nullable', 'string', 'max:50'],
                'badge_left'       => ['nullable', 'string', 'max:50'],
                'badge_right'      => ['nullable', 'string', 'max:50'],
                'benefit_1'        => ['nullable', 'string', 'max:100'],
                'benefit_2'        => ['nullable', 'string', 'max:100'],
                'start_at'         => ['nullable', 'date'],
                'end_at'           => ['nullable', 'date'],
                'status'           => ['required', 'integer'],
                'sort_order'       => ['nullable', 'integer'],
            ]);

            if (empty($data['sold'])) {
                $data['sold'] = 0;
            }
            if (empty($data['discount_label']) && !empty($data['discount_percent'])) {
                $data['discount_label'] = 'Giảm ' . $data['discount_percent'] . '%';
            }

            $flashSale = FlashSale::create($data);

            return response()->json([
                'message' => 'Tạo flash sale thành công',
                'data'    => $flashSale,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ==========================
    // ADMIN: CẬP NHẬT FLASH SALE
    // PUT /api/admin/flash-sales/{flashSale}
    // ==========================
    public function update(Request $request, FlashSale $flashSale)
    {
        try {
            $data = $request->validate([
                'product_id'       => ['required', 'integer', 'exists:products,id'],
                'flash_price'      => ['required', 'numeric'],
                'discount_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
                'sold'             => ['nullable', 'integer', 'min:0'],
                'discount_label'   => ['nullable', 'string', 'max:50'],
                'badge_left'       => ['nullable', 'string', 'max:50'],
                'badge_right'      => ['nullable', 'string', 'max:50'],
                'benefit_1'        => ['nullable', 'string', 'max:100'],
                'benefit_2'        => ['nullable', 'string', 'max:100'],
                'start_at'         => ['nullable', 'date'],
                'end_at'           => ['nullable', 'date'],
                'status'           => ['required', 'integer'],
                'sort_order'       => ['nullable', 'integer'],
            ]);

            if (empty($data['sold'])) {
                $data['sold'] = 0;
            }
            if (empty($data['discount_label']) && !empty($data['discount_percent'])) {
                $data['discount_label'] = 'Giảm ' . $data['discount_percent'] . '%';
            }

            $flashSale->update($data);

            return response()->json([
                'message' => 'Cập nhật flash sale thành công',
                'data'    => $flashSale,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ==========================
    // ADMIN: XÓA FLASH SALE
    // DELETE /api/admin/flash-sales/{flashSale}
    // ==========================
    public function destroy(FlashSale $flashSale)
    {
        try {
            $flashSale->delete();

            return response()->json([
                'message' => 'Xóa flash sale thành công',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
