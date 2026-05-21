<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::with('admin:id,name,email,role')
            ->orderBy('created_at', 'desc')
            ->paginate(50);
            
        return response()->json($logs);
    }
}
