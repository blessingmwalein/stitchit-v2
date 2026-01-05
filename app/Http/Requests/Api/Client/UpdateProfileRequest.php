<?php

namespace App\Http\Requests\Api\Client;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->user('sanctum')->id ?? null;

        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255', 'unique:clients,email,' . $clientId],
            'username' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:clients,username,' . $clientId],
            'address' => ['sometimes', 'nullable', 'string'],
            'gender' => ['sometimes', 'nullable', 'in:male,female,other'],
            'nickname' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
