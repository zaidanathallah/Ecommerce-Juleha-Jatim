<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'wijayapay' => [
        'mode' => env('WIJAYAPAY_MODE', 'sandbox'),
        'base_url' => env('WIJAYAPAY_BASE_URL', 'https://gateway.wijayapay.com'),
        'merchant_code' => env('WIJAYAPAY_MERCHANT_CODE', 'WP6ae1f439e5139'),
        'api_key' => env('WIJAYAPAY_API_KEY', 'yxdnarumkwqkdz38fwzjkezmx6tpkw'),
        'whitelist_ip' => env('WIJAYAPAY_WHITELIST_IP', '172.235.245.77'),
    ],

    'biteship' => [
        'base_url' => env('BITESHIP_BASE_URL', 'https://api.biteship.com'),
        'api_key' => env('BITESHIP_API_KEY'),
        'webhook_secret' => env('BITESHIP_WEBHOOK_SECRET'),
        'mode' => env('BITESHIP_MODE', 'draft'), // 'draft' (aman untuk testing/lokal, order masuk ke dashboard tanpa memanggil kurir fisik), 'live' (memanggil kurir penjemputan fisik langsung)
    ],

];
