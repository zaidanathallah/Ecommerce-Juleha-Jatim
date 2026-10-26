<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'juleha_id' => $user->juleha_id,
                    'region_code' => $user->region_code,
                    'region_name' => $user->region_name,
                    'address' => $user->address,
                    'lat' => $user->lat,
                    'lng' => $user->lng,
                    'is_verified' => (bool) $user->is_verified,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'appName' => config('app.name', 'Juleha Marketplace Jatim'),
            'site_settings' => fn () => \App\Models\SiteSetting::getIslamicSettings(),
        ];
    }
}
