<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadDPRequest extends FormRequest
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
            'dp_proof' => 'required_without:bukti_dp|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'bukti_dp' => 'required_without:dp_proof|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'dp_amount' => 'required|numeric|min:0',
        ];
    }

    /**
     * Get custom error messages for validator rules.
     */
    public function messages(): array
    {
        return [
            'dp_proof.required_without' => 'Bukti DP wajib diunggah',
            'dp_proof.file' => 'File tidak valid',
            'dp_proof.mimes' => 'Format file hanya JPG, JPEG, PNG, atau PDF',
            'dp_proof.max' => 'Ukuran file maksimal 2MB',
            'bukti_dp.required_without' => 'Bukti DP wajib diunggah',
            'bukti_dp.file' => 'File tidak valid',
            'bukti_dp.mimes' => 'Format file hanya JPG, JPEG, PNG, atau PDF',
            'bukti_dp.max' => 'Ukuran file maksimal 2MB',
            'dp_amount.required' => 'Jumlah DP wajib diisi',
            'dp_amount.numeric' => 'Jumlah DP harus berupa angka',
            'dp_amount.min' => 'Jumlah DP minimal 0',
        ];
    }
}
