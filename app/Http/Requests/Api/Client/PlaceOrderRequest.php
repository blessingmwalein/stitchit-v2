<?php

namespace App\Http\Requests\Api\Client;

use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['nullable', 'exists:clients,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string'],
            'items.*.width' => ['required', 'numeric', 'min:0'],
            'items.*.height' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price_per_item' => ['required', 'numeric', 'min:0'],
            'items.*.unit' => ['sometimes', 'string', 'in:cm,m,in,ft'],
            'items.*.design_image' => ['sometimes', 'image', 'max:5120'], // 5MB max
            'items.*.notes' => ['sometimes', 'nullable', 'string'],
            'delivery_address' => ['sometimes', 'nullable', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
