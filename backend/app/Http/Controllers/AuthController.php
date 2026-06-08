<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            ...$data,
            'password' => bcrypt($data['password'])
        ]);

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {

            return response()->json([
                'message' => 'Identifiants invalides'
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()
                ->currentAccessToken()
                ->delete();

        return response()->json([
            'message' => 'Déconnecté'
        ]);
    }
}