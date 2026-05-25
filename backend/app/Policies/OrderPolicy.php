<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can create orders.
     */
    public function create(User $user): bool
    {
        return $user->role === 'customer' || !isset($user->role);
    }

    /**
     * Determine whether the user can upload DP.
     */
    public function uploadDP(User $user, Order $order): bool
    {
        return $user->id === $order->user_id
            && $order->method === 'home_service'
            && in_array($order->status, ['pending', 'dp_uploaded']);
    }

    /**
     * Determine whether the user can update the order (only admin).
     */
    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view tracking info.
     */
    public function viewTracking(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->role === 'admin';
    }
}
