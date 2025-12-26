<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\ProductVariantValue;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    // POST /api/product-variants
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'sku'        => ['nullable', 'string', 'max:255'],
            'price'      => ['required', 'numeric'],
            'stock'      => ['required', 'integer', 'min:0'],
            'is_active'  => ['nullable', 'boolean'],
            'image'      => ['nullable', 'string', 'max:255'],
        ]);

        $data['is_active'] = $data['is_active'] ?? true;

        $variant = ProductVariant::create($data);

        return response()->json($variant, 201);
    }

    // POST /api/product-variants/{variant}/values
    public function addValue(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'attribute_id'       => ['required', 'exists:attributes,id'],
            'attribute_value_id' => ['required', 'exists:product_attribute_values,id'],
        ]);

        $value = ProductVariantValue::create([
            'product_variant_id' => $variant->id,
            'attribute_id'       => $data['attribute_id'],
            'attribute_value_id' => $data['attribute_value_id'],
        ]);

        return response()->json($value, 201);
    }
}
