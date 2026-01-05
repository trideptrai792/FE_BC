<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    // Client: lấy menu public theo vị trí (mainmenu/footermenu)
    public function index(Request $request)
    {
        $position = $request->query('position'); // optional
        $query = Menu::where('status', 1)->orderBy('sort_order');
        if ($position) {
            $query->where('position', $position);
        }
        return response()->json($query->get());
    }

    // Admin: danh sách có phân trang
    public function adminIndex()
    {
        $menus = Menu::orderBy('sort_order')->orderBy('id')->paginate(20);
        return response()->json([
            'data' => $menus->items(),
            'meta' => [
                'current_page' => $menus->currentPage(),
                'per_page'     => $menus->perPage(),
                'total'        => $menus->total(),
                'last_page'    => $menus->lastPage(),
            ],
        ]);
    }
public function show(Menu $menu)
{
    return response()->json($menu);
}
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'link'       => 'required|string|max:255',
            'type'       => 'required|in:category,page,topic,custom',
            'parent_id'  => 'nullable|integer|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'table_id'   => 'nullable|integer',
            'position'   => 'required|in:mainmenu,footermenu',
            'status'     => 'nullable|in:0,1',
        ]);

        $data['parent_id']  = $data['parent_id'] ?? 0;
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['status']     = $data['status'] ?? 1;
        $data['created_by'] = $request->user()?->id ?? 1;

        $menu = Menu::create($data);
        return response()->json($menu, 201);
    }

    public function update(Request $request, Menu $menu)
    {
        $data = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'link'       => 'sometimes|required|string|max:255',
            'type'       => 'sometimes|required|in:category,page,topic,custom',
            'parent_id'  => 'nullable|integer|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'table_id'   => 'nullable|integer',
            'position'   => 'sometimes|required|in:mainmenu,footermenu',
            'status'     => 'nullable|in:0,1',
        ]);

        // Ép default để tránh null vi phạm NOT NULL
        $data['parent_id']  = $data['parent_id'] ?? 0;
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['status']     = $data['status'] ?? 1;

        $data['updated_by'] = $request->user()?->id;
        $menu->update($data);

        return response()->json($menu);
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
