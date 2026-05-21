<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $orderUuid,
        public string $status,
        public array $extra = [],
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("order.{$this->orderUuid}");
    }

    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'uuid'   => $this->orderUuid,
            'status' => $this->status,
            'extra'  => $this->extra,
        ];
    }
}
