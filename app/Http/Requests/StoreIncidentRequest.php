<?php

namespace App\Http\Requests;

use App\Enums\IncidentPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:10000'],

            'company' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],

            'priority' => [
                'required',
                Rule::enum(IncidentPriority::class),
            ],

            'requester_name' => ['required', 'string', 'max:150'],
            'requester_email' => ['required', 'email', 'max:150'],
            'requester_phone' => ['required', 'string', 'max:30'],

            'assigned_to' => ['nullable', 'string', 'max:150'],
        ];
    }
}
