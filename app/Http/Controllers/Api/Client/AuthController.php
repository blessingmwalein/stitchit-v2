<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Client\LoginRequest;
use App\Http\Requests\Api\Client\RegisterRequest;
use App\Http\Requests\Api\Client\UpdateProfileRequest;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @group Authentication
 * 
 * APIs for client registration, login, password reset, and profile management
 */
class AuthController extends Controller
{
    /**
     * Register a new client
     * 
     * Create a new client account with phone number and email. Returns authentication token.
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Registration successful",
     *   "data": {
     *     "client": {
     *       "id": 1,
     *       "full_name": "John Doe",
     *       "phone": "+263771234567",
     *       "email": "john@example.com",
     *       "username": "johndoe",
     *       "address": "123 Main St, Harare",
     *       "gender": "male"
     *     },
     *     "token": "1|abcdefghijklmnopqrstuvwxyz"
     *   }
     * }
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $client = Client::create([
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'gender' => $request->gender,
        ]);

        $token = $client->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'client' => [
                    'id' => $client->id,
                    'full_name' => $client->full_name,
                    'phone' => $client->phone,
                    'email' => $client->email,
                    'username' => $client->username,
                    'address' => $client->address,
                    'gender' => $client->gender,
                ],
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login client
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Find client by phone or email
        $client = Client::where('phone', $request->login)
            ->orWhere('email', $request->login)
            ->first();

        if (!$client || !Hash::check($request->password, $client->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Update last login
        $client->update(['last_login_at' => now()]);

        // Revoke all previous tokens
        $client->tokens()->delete();

        // Create new token
        $token = $client->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'client' => [
                    'id' => $client->id,
                    'full_name' => $client->full_name,
                    'phone' => $client->phone,
                    'email' => $client->email,
                    'username' => $client->username,
                    'address' => $client->address,
                    'gender' => $client->gender,
                    'nickname' => $client->nickname,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Get authenticated client profile
     */
    public function profile(Request $request): JsonResponse
    {
        $client = $request->user('sanctum');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $client->id,
                'full_name' => $client->full_name,
                'phone' => $client->phone,
                'email' => $client->email,
                'username' => $client->username,
                'address' => $client->address,
                'gender' => $client->gender,
                'nickname' => $client->nickname,
                'created_at' => $client->created_at,
                'last_login_at' => $client->last_login_at,
            ],
        ]);
    }

    /**
     * Update client profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $client = $request->user('sanctum');
        
        $client->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $client->id,
                'full_name' => $client->full_name,
                'phone' => $client->phone,
                'email' => $client->email,
                'username' => $client->username,
                'address' => $client->address,
                'gender' => $client->gender,
                'nickname' => $client->nickname,
            ],
        ]);
    }

    /**
     * Logout client
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user('sanctum')->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Request password reset (send code)
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $client = Client::where('phone', $request->phone)->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this phone number',
            ], 404);
        }

        // Generate 6-digit code
        $code = rand(100000, 999999);

        // Store code in cache for 10 minutes
        cache()->put("password_reset_{$client->phone}", $code, now()->addMinutes(10));

        // TODO: Send SMS with code using your SMS provider
        // For now, return code in response (remove in production)
        
        return response()->json([
            'success' => true,
            'message' => 'Password reset code sent to your phone',
            'debug_code' => $code, // Remove in production
        ]);
    }

    /**
     * Reset password with code
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'code' => ['required', 'string'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $client = Client::where('phone', $request->phone)->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this phone number',
            ], 404);
        }

        $storedCode = cache()->get("password_reset_{$client->phone}");

        if (!$storedCode || $storedCode != $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset code',
            ], 400);
        }

        $client->update([
            'password' => Hash::make($request->password),
        ]);

        // Clear the reset code
        cache()->forget("password_reset_{$client->phone}");

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully',
        ]);
    }
}
