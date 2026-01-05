<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Đăng nhập: email/username + password -> trả về token
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string', // email hoặc username
            'password' => 'required|string',
        ]);

        // Xác định login theo email hay username
        $field = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($field, $request->login)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Tài khoản hoặc mật khẩu không đúng.'],
            ]);
        }

        // Xoá token cũ (nếu muốn)
        $user->tokens()->delete();

        // Tạo token mới cho Next.js / mobile
        $token = $user->createToken('web_token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'username' => $user->username,
                'phone'    => $user->phone,
                'roles'    => $user->roles,
                'avatar'   => $user->avatar,
            ],
            'token' => $token,
        ]);
    }

    // Lấy thông tin user từ token
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
   
      
public function register(Request $request)
    {
        // 1. Validate dữ liệu từ FE
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'required|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        // 2. Tạo user. LƯU Ý: cột là `roles` (số nhiều)
        $user = User::create([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'phone'      => $validated['phone'],
            'password'   => Hash::make($validated['password']),
            'roles'      => 'customer',   // dùng đúng tên cột
            'username'   => $validated['email'] ?? null, // nếu cột username NOT NULL thì gán tạm
            'avatar'     => null,

        ]);

        // 3. Tạo token Sanctum
        $token = $user->createToken('api_token')->plainTextToken;

        // 4. Trả về JSON cho FE
        return response()->json([
            'message' => 'Đăng ký thành công',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    // Đăng xuất: xoá token hiện tại
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất',
        ]);
    }
}
