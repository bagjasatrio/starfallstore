<?php

namespace App\Http\Middleware;

use Closure;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ValidateTurnstileToken
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client(['base_uri' => 'https://challenges.cloudflare.com']);
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Skip validation in local or testing environment
        if (app()->environment('local', 'testing')) {
            return $next($request);
        }

        $token = $request->input('cf_turnstile_response') ?? $request->header('X-Turnstile-Token');

        if (empty($token)) {
            return response()->json([
                'message' => 'Verifikasi bot diperlukan. Harap selesaikan Turnstile.',
                'errors' => ['cf_turnstile_response' => ['Token Cloudflare Turnstile tidak ditemukan.']],
            ], 422);
        }

        try {
            $response = $this->client->post('/turnstile/v0/siteverify', [
                'form_params' => [
                    'secret'   => config('services.cloudflare.turnstile_secret'),
                    'response' => $token,
                    'remoteip' => $request->ip(),
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!($data['success'] ?? false)) {
                Log::warning('Turnstile validation failed', [
                    'ip' => $request->ip(),
                    'codes' => $data['error-codes'] ?? [],
                ]);
                return response()->json([
                    'message' => 'Verifikasi bot gagal. Harap coba lagi.',
                    'errors' => ['cf_turnstile_response' => ['Verifikasi Cloudflare Turnstile gagal.']],
                ], 422);
            }
        } catch (\Exception $e) {
            Log::error('Turnstile verification exception', ['error' => $e->getMessage()]);
            // Fail open on network errors (don't block users due to Cloudflare outage)
            return $next($request);
        }

        return $next($request);
    }
}
