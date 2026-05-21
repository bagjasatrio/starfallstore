<?php

return [

    /*
    |──────────────────────────────────────────────────────────────────────────
    | Third Party Services
    |──────────────────────────────────────────────────────────────────────────
    */

    'mailgun' => [
        'domain'   => env('MAILGUN_DOMAIN'),
        'secret'   => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme'   => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // ── CASHI.ID Payment Gateway ──────────────────────────────────────────────
    'cashi' => [
        'base_url'       => env('CASHI_BASE_URL', 'https://api.cashi.id/v1'),
        'merchant_id'    => env('CASHI_MERCHANT_ID'),
        'api_key'        => env('CASHI_API_KEY'),
        'webhook_secret' => env('CASHI_WEBHOOK_SECRET'),
    ],

    // ── Digiflazz H2H ─────────────────────────────────────────────────────────
    'digiflazz' => [
        'base_url'       => env('DIGIFLAZZ_BASE_URL', 'https://api.digiflazz.com/v1'),
        'username'       => env('DIGIFLAZZ_USERNAME'),
        'api_key'        => env('DIGIFLAZZ_API_KEY'),
        'webhook_secret' => env('DIGIFLAZZ_WEBHOOK_SECRET'),
        'mode'           => env('DIGIFLAZZ_MODE', 'production'),
    ],

    // ── Cloudflare Turnstile ──────────────────────────────────────────────────
    'cloudflare' => [
        'turnstile_secret' => env('CLOUDFLARE_TURNSTILE_SECRET_KEY'),
    ],

    // ── Fonnte WhatsApp API ───────────────────────────────────────────────────
    'fonnte' => [
        'base_url' => env('FONNTE_BASE_URL', 'https://api.fonnte.com'),
        'token'    => env('FONNTE_TOKEN'),
        'device'   => env('FONNTE_DEVICE'),
    ],

];
