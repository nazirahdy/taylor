<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderRequest extends FormRequest
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
            'quota_date' => 'required|date|after_or_equal:today',
            'method' => 'required|in:home_service,visit',
            'design_notes' => 'required|string|min:5',
            'design_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'gallery_image_path' => 'nullable|string',
            'alamat' => 'nullable|string|min:5',
            'dp_proof' => 'nullable|image|mimes:jpg,jpeg,png|max:4096',
        ];
    }

    /**
     * Get custom error messages for validator rules.
     */
    public function messages(): array
    {
        return [
            'quota_date.required' => 'Pilih tanggal layanan terlebih dahulu',
            'quota_date.date' => 'Format tanggal tidak valid',
            'quota_date.after_or_equal' => 'Tanggal harus hari ini atau di masa depan',
            'method.required' => 'Pilih metode layanan',
            'method.in' => 'Metode layanan tidak valid',
            'design_notes.required' => 'Deskripsi desain wajib diisi',
            'design_notes.min' => 'Deskripsi desain minimal 5 karakter',
            'design_image.image' => 'File harus berupa gambar',
            'design_image.mimes' => 'Format gambar hanya JPG, JPEG, atau PNG',
            'design_image.max' => 'Ukuran gambar maksimal 2MB',
        ];
    }
}
