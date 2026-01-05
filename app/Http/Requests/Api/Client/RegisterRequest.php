<?php

namespace App\Http\Requests\Api\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'unique:clients,phone'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:clients,email'],
            'username' => ['nullable', 'string', 'max:255', 'unique:clients,username'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'address' => ['nullable', 'string'],
            'gender' => ['nullable', 'in:male,female,other'],
        ];
    }
}
