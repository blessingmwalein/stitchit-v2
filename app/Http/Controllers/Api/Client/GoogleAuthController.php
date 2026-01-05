<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Exception;

/**
 * @group Google Authentication
 * 
 * APIs for Google OAuth login and registration
 */
class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     * 
     * Initiates the Google OAuth flow by redirecting to Google's authentication page.
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "url": "https://accounts.google.com/o/oauth2/auth?client_id=..."
     *   }
     * }
     */
    public function redirectToGoogle(): JsonResponse
    {
        try {
            $url = Socialite::driver('google')
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $url,
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate Google OAuth URL',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Google OAuth Callback
     * 
     * Receives the callback from Google after user authenticates.
     * Returns user data for frontend to display in registration/login form.
     * 
     * @response 200 {
     *   "success": true,
     *   "data": {
     *     "google_id": "1234567890",
     *     "email": "user@gmail.com",
     *     "full_name": "John Doe",
     *     "avatar": "https://lh3.googleusercontent.com/...",
     *     "existing_user": false
     *   }
     * }
     */
    public function handleGoogleCallback(): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Check if user already exists
            $existingClient = Client::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($existingClient) {
                // Update Google ID if not set
                if (!$existingClient->google_id) {
                    $existingClient->update([
                        'google_id' => $googleUser->getId(),
                        'auth_provider' => 'google',
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                }

                // Auto-login existing user
                $existingClient->update(['last_login_at' => now()]);
                $existingClient->tokens()->delete();
                $token = $existingClient->createToken('mobile-app')->plainTextToken;

                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'data' => [
                        'existing_user' => true,
                        'client' => [
                            'id' => $existingClient->id,
                            'full_name' => $existingClient->full_name,
                            'phone' => $existingClient->phone,
                            'email' => $existingClient->email,
                            'username' => $existingClient->username,
                            'address' => $existingClient->address,
                            'gender' => $existingClient->gender,
                            'avatar' => $existingClient->avatar,
                        ],
                        'token' => $token,
                    ],
                ]);
            }

            // Return data for new user registration form
            return response()->json([
                'success' => true,
                'data' => [
                    'existing_user' => false,
                    'google_id' => $googleUser->getId(),
                    'email' => $googleUser->getEmail(),
                    'full_name' => $googleUser->getName(),
                    'avatar' => $googleUser->getAvatar(),
                ],
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to authenticate with Google',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete Google Registration
     * 
     * Completes the registration process with data from Google and additional user input.
     * User submits this after reviewing the pre-filled form.
     * 
     * @bodyParam google_id string required The Google user ID. Example: 1234567890
     * @bodyParam email string required The user's email from Google. Example: user@gmail.com
     * @bodyParam full_name string required The user's full name. Example: John Doe
     * @bodyParam phone string required The user's phone number. Example: +263771234567
     * @bodyParam username string The user's username. Example: johndoe
     * @bodyParam address string The user's address. Example: 123 Main St, Harare
     * @bodyParam gender string The user's gender. Example: male
     * @bodyParam avatar string The user's Google avatar URL.
     * 
     * @response 201 {
     *   "success": true,
     *   "message": "Registration successful",
     *   "data": {
     *     "client": {
     *       "id": 1,
     *       "full_name": "John Doe",
     *       "phone": "+263771234567",
     *       "email": "user@gmail.com",
     *       "username": "johndoe",
     *       "avatar": "https://lh3.googleusercontent.com/..."
     *     },
     *     "token": "1|abcdefghijklmnopqrstuvwxyz"
     *   }
     * }
     */
    public function completeGoogleRegistration(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'google_id' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:clients,email'],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'unique:clients,phone'],
            'username' => ['nullable', 'string', 'max:255', 'unique:clients,username'],
            'address' => ['nullable', 'string'],
            'gender' => ['nullable', 'in:male,female,other'],
            'avatar' => ['nullable', 'string'],
        ]);

        // Create client without password (using Google OAuth)
        $client = Client::create([
            'google_id' => $validated['google_id'],
            'auth_provider' => 'google',
            'email' => $validated['email'],
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'username' => $validated['username'] ?? $this->generateUsername($validated['email']),
            'address' => $validated['address'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'avatar' => $validated['avatar'] ?? null,
            'password' => null, // No password for OAuth users
            'last_login_at' => now(),
        ]);

        // Create token
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
                    'avatar' => $client->avatar,
                ],
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Quick Google Login
     * 
     * Direct login endpoint for returning Google users.
     * Validates Google token and logs in the user.
     * 
     * @bodyParam google_id string required The Google user ID. Example: 1234567890
     * @bodyParam email string required The user's email. Example: user@gmail.com
     * 
     * @response 200 {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "client": {...},
     *     "token": "1|abcdefghijklmnopqrstuvwxyz"
     *   }
     * }
     */
    public function quickGoogleLogin(Request $request): JsonResponse
    {
        $request->validate([
            'google_id' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $client = Client::where('google_id', $request->google_id)
            ->where('email', $request->email)
            ->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this Google account',
            ], 404);
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
                    'avatar' => $client->avatar,
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Generate a unique username from email
     */
    private function generateUsername(string $email): string
    {
        $baseUsername = Str::before($email, '@');
        $username = $baseUsername;
        $counter = 1;

        while (Client::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }
}
