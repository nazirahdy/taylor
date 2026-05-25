<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MeasurementRequest;
use App\Models\Measurement;
use Illuminate\Support\Facades\Auth;

class MeasurementController extends Controller
{
    /**
     * Get measurement data for the authenticated user.
     */
    public function show()
    {
        $user = Auth::user();
        $measurement = $user->measurement;

        if (!$measurement) {
            return response()->json([
                'success' => false,
                'message' => 'Data ukuran belum ada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $measurement
        ]);
    }

    /**
     * Store or update measurement data for authenticated user.
     */
    public function store(MeasurementRequest $request)
    {
        $user = Auth::user();

        $measurement = Measurement::updateOrCreate(
            ['user_id' => $user->id],
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Data ukuran berhasil disimpan',
            'data' => $measurement
        ], 201);
    }

    /**
     * Update measurement data for authenticated user.
     */
    public function update(MeasurementRequest $request)
    {
        $user = Auth::user();

        $measurement = Measurement::where('user_id', $user->id)->first();

        if (!$measurement) {
            return response()->json([
                'success' => false,
                'message' => 'Data ukuran tidak ditemukan'
            ], 404);
        }

        $measurement->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Data ukuran berhasil diperbarui',
            'data' => $measurement
        ]);
    }

    /**
     * Delete measurement data for authenticated user.
     */
    public function destroy()
    {
        $user = Auth::user();

        $measurement = Measurement::where('user_id', $user->id)->first();

        if (!$measurement) {
            return response()->json([
                'success' => false,
                'message' => 'Data ukuran tidak ditemukan'
            ], 404);
        }

        $measurement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data ukuran berhasil dihapus'
        ]);
    }
}
