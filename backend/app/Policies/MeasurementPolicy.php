<?php

namespace App\Policies;

use App\Models\Measurement;
use App\Models\User;

class MeasurementPolicy
{
    /**
     * Determine whether the user can view the measurement.
     */
    public function view(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can create measurements.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the measurement.
     */
    public function update(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id;
    }

    /**
     * Determine whether the user can delete the measurement.
     */
    public function delete(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id || $user->role === 'admin';
    }
}
