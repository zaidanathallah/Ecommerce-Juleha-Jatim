<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageUploadService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Upload, resize, and compress an image file to WebP format.
     * Keeps aspect ratio, limits max-width to 1200px, quality 75-80%
     * to ensure HD clarity while keeping file size strictly lightweight (<300KB).
     *
     * @param UploadedFile $file
     * @param string $directory Subfolder inside storage/app/public
     * @param int $maxWidth Max width in pixels (default: 1200)
     * @param int $quality Compression quality percentage (default: 75)
     * @return string Relative URL path starting with /storage/
     */
    public function uploadAndCompress(
        UploadedFile $file,
        string $directory = 'uploads',
        int $maxWidth = 1200,
        int $quality = 75
    ): string {
        // Read file using Intervention Image v3
        $image = $this->manager->read($file->getRealPath());

        // Scale down width if exceeds maxWidth while preserving aspect ratio
        if ($image->width() > $maxWidth) {
            $image->scaleDown(width: $maxWidth);
        }

        // Safeguard for very tall images (max height 1600px)
        if ($image->height() > 1600) {
            $image->scaleDown(height: 1600);
        }

        // Convert and compress to WebP
        $encoded = $image->toWebp($quality);

        // Generate clean random filename with .webp extension
        $cleanDir = trim($directory, '/');
        $filename = Str::random(40) . '.webp';
        $relativeDiskPath = $cleanDir . '/' . $filename;

        // Save to public disk (storage/app/public/...)
        Storage::disk('public')->put($relativeDiskPath, (string) $encoded);

        return '/storage/' . $relativeDiskPath;
    }
}
