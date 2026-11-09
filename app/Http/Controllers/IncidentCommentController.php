<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class IncidentCommentController extends Controller
{
    public function store(
        Request $request,
        Incident $incident
    ): RedirectResponse {
        $data = $request->validate([
            'author_name' => [
                'required', 'string', 'max:150'
            ],
            'body' => [
                'required', 'string', 'max:5000'
            ],
        ]);

        $incident->comments()->create($data);

        return redirect()
            ->route('incidents.index')
            ->with('success', 'Comentario añadido.');
    }
}
