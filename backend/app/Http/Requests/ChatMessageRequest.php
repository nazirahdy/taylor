<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatMessageRequest extends FormRequest
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
            'message' => 'required|string|min:1|max:1000',
            'attachment' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];
    }

    /**
     * Get custom error messages for validator rules.
     */
    public function messages(): array
    {
        return [
            'message.required' => 'Pesan wajib diisi',
            'message.min' => 'Pesan tidak boleh kosong',
            'message.max' => 'Pesan maksimal 1000 karakter',
            'attachment.image' => 'File harus berupa gambar',
            'attachment.mimes' => 'Format gambar hanya JPG, JPEG, atau PNG',
            'attachment.max' => 'Ukuran gambar maksimal 2MB',
        ];
    }
}
