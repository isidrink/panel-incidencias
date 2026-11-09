<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\IncidentCommentController;

Route::get('/', [IncidentController::class, 'index'])
    ->name('incidents.index');

Route::post('/incidents', [IncidentController::class, 'store'])
    ->name('incidents.store');

Route::post(
    '/incidents/{incident}/comments',
    [IncidentCommentController::class, 'store']
)->name('incidents.comments.store');

Route::patch(
    '/incidents/{incident}/status',
    [IncidentController::class, 'updateStatus']
)->name('incidents.update-status');


Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
