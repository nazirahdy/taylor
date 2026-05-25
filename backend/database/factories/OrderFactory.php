<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'order_number' => 'EJ-' . strtoupper(fake()->unique()->bothify('????????')),
            'user_id' => User::factory(),
            'order_date' => now()->toDateString(),
            'quota_date' => now()->addDays(2)->toDateString(),
            'method' => 'visit',
            'design_notes' => fake()->sentence(),
            'status' => 'pending',
            'estimated_price' => 0,
            'dp_amount' => 0,
        ];
    }
}
