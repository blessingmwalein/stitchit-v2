<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class SendMailController extends Controller
{
    public function send(Request $request)
    {
        $to = 'shumbafariraishe@gmail.com';
        $subject = 'Test Email from API';
        $body = 'This is a test email sent via API route.';

        try {
            Mail::raw($body, function (Message $message) use ($to, $subject) {
                $message->to($to)
                        ->subject($subject);
            });
            return response()->json(['success' => true, 'message' => 'Email sent successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
