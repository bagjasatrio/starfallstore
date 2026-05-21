<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // ─── Register ─────────────────────────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:100', 'regex:/^[\pL\s\-]+$/u'],
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-zA-Z0-9_]+$/', 'unique:users'],
            'email'    => ['required', 'email:rfc,dns', 'max:255', 'unique:users'],
            'phone'    => ['required', 'string', 'min:10', 'max:15', 'regex:/^[0-9]+$/', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ]);

        $user = User::create([
            'name'     => strip_tags($data['name']),
            'username' => strtolower($data['username']),
            'email'    => strtolower($data['email']),
            'phone'    => $data['phone'],
            'password' => $data['password'],
            'role'     => 'buyer',
        ]);

        $token = $user->createToken('auth_token', ['role:buyer'])->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil! Selamat datang di StarfallStore.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ], 201);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        // Allow login with username OR email
        $field = filter_var($data['username'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $credentials = [$field => strtolower($data['username']), 'password' => $data['password']];

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Username atau kata sandi salah.'], 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Akun Anda telah dinonaktifkan.'], 403);
        }

        // Revoke previous tokens
        $user->tokens()->delete();

        $abilities = $user->isAdmin() ? ['role:admin', 'role:buyer'] : ['role:buyer'];
        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ]);
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil.']);
    }

    // ─── Me ───────────────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function formatUser(User $user): array
    {
        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'username'       => $user->username,
            'email'          => $user->email,
            'phone'          => $user->phone,
            'role'           => $user->role,
            'wallet_balance' => (float) $user->wallet_balance,
            'avatar_url'     => $user->avatar_url,
        ];
    }
}
