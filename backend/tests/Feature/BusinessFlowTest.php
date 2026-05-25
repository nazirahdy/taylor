<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use App\Models\DeliveryArea;
use App\Models\DailyQuota;
use App\Services\WhatsAppService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Mockery;

class BusinessFlowTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $whatsAppServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock WhatsAppService to avoid actual HTTP calls
        $this->whatsAppServiceMock = Mockery::mock(WhatsAppService::class);
        $this->app->instance(WhatsAppService::class, $this->whatsAppServiceMock);
    }

    /**
     * TC-01: Registrasi data valid
     */
    public function test_user_can_register()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Nazira Hidayatullah',
            'email' => 'nazira@example.com',
            'phone_wa' => '082384752631',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registrasi berhasil',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'nazira@example.com',
            'phone_wa' => '082384752631',
        ]);
    }

    /**
     * TC-02: Registrasi email duplikat
     */
    public function test_user_cannot_register_with_duplicate_email()
    {
        User::factory()->create(['email' => 'nazira@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Nazira Copy',
            'email' => 'nazira@example.com',
            'phone_wa' => '082384752632',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-04: Login benar
     */
    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil',
            ])
            ->assertJsonStructure([
                'data' => ['user', 'token']
            ]);
    }

    /**
     * TC-06: Buat pesanan, kuota tersedia
     */
    public function test_user_can_create_order()
    {
        $user = User::factory()->create();
        $deliveryArea = DeliveryArea::create([
            'name' => 'Pauh',
            'price' => 15000,
            'is_active' => true
        ]);

        $quotaDate = now()->addDays(2)->toDateString();
        DailyQuota::create([
            'date' => $quotaDate,
            'max_orders' => 5,
            'current_orders' => 0,
            'is_open' => true
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/orders', [
                'quota_date' => $quotaDate,
                'method' => 'home_service',
                'delivery_area_id' => $deliveryArea->id,
                'design_notes' => 'Tolong buatkan gamis dengan model A-line',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
            ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'quota_date' => $quotaDate,
            'method' => 'home_service',
            'status' => 'pending',
        ]);

        $this->assertEquals(1, DailyQuota::where('date', $quotaDate)->first()->current_orders);
    }

    /**
     * TC-08: Upload bukti DP format valid
     */
    public function test_user_can_upload_dp()
    {
        Storage::fake('private');

        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'method' => 'home_service',
            'status' => 'pending'
        ]);

        $file = UploadedFile::fake()->image('bukti_dp.jpg');

        $response = $this->actingAs($user)
            ->postJson("/api/orders/{$order->id}/dp", [
                'dp_proof' => $file,
                'dp_amount' => 50000,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Bukti DP berhasil diunggah.',
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'dp_uploaded',
            'dp_amount' => 50000,
        ]);

        $updatedOrder = Order::find($order->id);
        Storage::disk('private')->assertExists($updatedOrder->dp_proof_path);
    }

    /**
     * TC-11: Admin approve DP (Confirm Order)
     */
    public function test_admin_can_confirm_order()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['phone_wa' => '082384752631']);
        
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'dp_uploaded',
            'method' => 'home_service',
            'dp_proof_path' => 'some/path.jpg',
            'estimated_price' => 200000
        ]);

        // Expect WhatsApp notification
        $this->whatsAppServiceMock->shouldReceive('notifyOrderConfirmed')
            ->once()
            ->with(Mockery::on(function($arg) use ($order) {
                return $arg->id === $order->id;
            }));

        $response = $this->actingAs($admin)
            ->postJson("/api/orders/{$order->id}/confirm");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pesanan berhasil dikonfirmasi',
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * TC-13: Admin update progres
     */
    public function test_admin_can_update_progress()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['phone_wa' => '082384752631']);
        
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'confirmed'
        ]);

        // Expect WhatsApp notification
        $this->whatsAppServiceMock->shouldReceive('notifyProgressUpdate')
            ->once();

        $response = $this->actingAs($admin)
            ->postJson("/api/orders/{$order->id}/progress", [
                'stage' => 'Pemotongan Kain',
                'description' => 'Kain sudah mulai dipotong sesuai ukuran',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Progres berhasil diperbarui',
            ]);

        $this->assertDatabaseHas('progress_logs', [
            'order_id' => $order->id,
            'stage' => 'Pemotongan Kain',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'in_progress',
        ]);
    }
}
