<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MeasurementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'lingkar_badan' => 'nullable|numeric|min:0|max:999.99',
            'lingkar_pinggang' => 'nullable|numeric|min:0|max:999.99',
            'lingkar_pinggul' => 'nullable|numeric|min:0|max:999.99',
            'panjang_baju' => 'nullable|numeric|min:0|max:999.99',
            'panjang_lengan' => 'nullable|numeric|min:0|max:999.99',
            'lebar_bahu' => 'nullable|numeric|min:0|max:999.99',
            'panjang_rok' => 'nullable|numeric|min:0|max:999.99',
            'tinggi_badan' => 'nullable|numeric|min:0|max:999.99',
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom error messages for validator rules.
     */
    public function messages(): array
    {
        return [
            'lingkar_badan.numeric' => 'Lingkar badan harus berupa angka',
            'lingkar_pinggang.numeric' => 'Lingkar pinggang harus berupa angka',
            'lingkar_pinggul.numeric' => 'Lingkar pinggul harus berupa angka',
            'panjang_baju.numeric' => 'Panjang baju harus berupa angka',
            'panjang_lengan.numeric' => 'Panjang lengan harus berupa angka',
            'lebar_bahu.numeric' => 'Lebar bahu harus berupa angka',
            'panjang_rok.numeric' => 'Panjang rok harus berupa angka',
            'tinggi_badan.numeric' => 'Tinggi badan harus berupa angka',
        ];
    }
}
