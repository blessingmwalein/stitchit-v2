<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload a file
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'collection' => 'nullable|string',
        ]);

        try {
            $file = $request->file('file');
            $collection = $request->input('collection', 'default');
            
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Store file
            $path = $file->storeAs(
                "uploads/{$collection}",
                $filename,
                'public'
            );

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => [
                    'path' => $path,
                    'url' => Storage::disk('public')->url($path),
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Delete a file
     */
    public function delete(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        try {
            $path = $request->input('path');
            
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                
                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * List files in a collection
     */
    public function list(Request $request)
    {
        $collection = $request->input('collection', 'default');
        
        try {
            $files = Storage::disk('public')->files("uploads/{$collection}");
            
            $filesData = array_map(function ($path) {
                return [
                    'path' => $path,
                    'url' => Storage::disk('public')->url($path),
                    'size' => Storage::disk('public')->size($path),
                    'last_modified' => Storage::disk('public')->lastModified($path),
                ];
            }, $files);

            return response()->json([
                'success' => true,
                'data' => $filesData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to list files: ' . $e->getMessage(),
            ], 422);
        }
    }
}
