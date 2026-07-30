<?php

namespace App\Policies;

use App\Models\Measurement;
use App\Models\User;

class MeasurementPolicy
{
    
    public function view(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id || $user->role === 'admin';
    }


    public function create(User $user): bool
    {
        return true;
    }


    public function update(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id;
    }


    public function delete(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id || $user->role === 'admin';
    }
}
