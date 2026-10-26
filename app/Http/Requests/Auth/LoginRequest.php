<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required_without:email', 'string'],
            'email' => ['nullable', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials (by Email or ID Juleha).
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $loginInput = trim((string) ($this->input('login') ?: $this->input('email')));
        $isEmail = filter_var($loginInput, FILTER_VALIDATE_EMAIL);

        $field = $isEmail ? 'email' : 'juleha_id';

        // 1. Cek keberadaan user terlebih dahulu untuk memberikan notifikasi spesifik
        $user = User::where($field, $loginInput)->first();
        if (! $user) {
            RateLimiter::hit($this->throttleKey());
            $label = $isEmail ? 'Alamat Email' : 'Nomor ID Juleha';
            throw ValidationException::withMessages([
                'login' => "{$label} '{$loginInput}' tidak terdaftar dalam sistem Juleha Jawa Timur. Silakan periksa kembali penulisan Anda atau daftar akun baru.",
            ]);
        }

        // 2. Cek kecocokan password
        $credentials = [
            $field => $loginInput,
            'password' => $this->string('password'),
        ];

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'password' => 'Kata sandi (password) yang Anda masukkan salah. Silakan klik ikon mata di kolom password untuk memeriksa kembali ketikan Anda.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited (Max 5 attempts / minute).
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        $loginInput = trim((string) ($this->input('login') ?: $this->input('email')));
        return Str::transliterate(Str::lower($loginInput).'|'.$this->ip());
    }
}
