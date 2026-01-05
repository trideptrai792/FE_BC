<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request; 

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::orderByDesc('id')->paginate(20);

        return response()->json([
            'data'  => $users->items(),
            'meta'  => [
                'current_page' => $users->currentPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
                'last_page'    => $users->lastPage(),
            ],
        ]);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'data' => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'phone'    => 'nullable|string|max:20',
            'roles'    => 'nullable|string|in:admin,customer',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Cập nhật user thành công',
            'data'    => $user,
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Xóa user thành công',
        ]);
    }
}

