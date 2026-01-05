<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;



class GoogleAuthController extends Controller
{
    public function redirect()
    {return Socialite::driver('google')
        ->stateless()
        ->with(['prompt' => 'select_account'])
        ->redirect();
    }

    public function callback(Request $request)
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        // Tìm hoặc tạo user
        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                   'name'     => $googleUser->getName() ?: $googleUser->getEmail(),
                'username' => $googleUser->getEmail(),
                'roles'    => 'customer', 
                'password' => Hash::make(Str::random(32))]
        );

        $token = $user->createToken('api_token')->plainTextToken;

        // Lấy redirect FE từ query (như bạn đã dùng)
        $redirect = $request->query(
            'redirect',
            'http://localhost:3000/login-success'
        );
        

        // Gửi token + name + role qua query string
        $query = http_build_query([
            'token' => $token,
            'name'  => $user->name,
            'role'  => $user->roles,
        ]);

        return redirect()->away($redirect . '?' . $query);
    }
}
