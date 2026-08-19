<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

/**
 * Normalizes a view-submission screenshot before it's stored: caps its
 * dimensions and re-encodes it as a JPEG, so the admin review UI (a fixed
 * aspect-[3/4] card) always gets something predictable regardless of what
 * an ambassador's phone/screenshot tool actually produced — a 6000px-tall
 * screenshot or an unusual aspect ratio no longer bloats page weight or
 * looks stretched/cropped oddly next to every other submission.
 */
class ScreenshotProcessor
{
    private const MAX_WIDTH = 1080;

    private const MAX_HEIGHT = 1920;

    private const JPEG_QUALITY = 85;

    /**
     * Returns JPEG-encoded image bytes, resized to fit within the max
     * dimensions (never upscaled). Falls back to the original file's
     * contents if GD can't decode it, rather than blocking the submission
     * over a processing failure.
     */
    public function process(UploadedFile $file): string
    {
        $original = @file_get_contents($file->getRealPath());

        if ($original === false) {
            return '';
        }

        $source = @imagecreatefromstring($original);

        if (! $source) {
            Log::warning('ScreenshotProcessor: GD could not decode the upload, storing it as-is.', [
                'mime' => $file->getMimeType(),
            ]);

            return $original;
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, self::MAX_WIDTH / $width, self::MAX_HEIGHT / $height);

        if ($scale >= 1) {
            $resized = $source;
        } else {
            $targetWidth = (int) round($width * $scale);
            $targetHeight = (int) round($height * $scale);

            $resized = imagecreatetruecolor($targetWidth, $targetHeight);
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
            imagedestroy($source);
        }

        ob_start();
        imagejpeg($resized, null, self::JPEG_QUALITY);
        $encoded = ob_get_clean();
        imagedestroy($resized);

        return $encoded !== false ? $encoded : $original;
    }
}
