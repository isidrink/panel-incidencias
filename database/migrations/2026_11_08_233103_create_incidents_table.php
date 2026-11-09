
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();

            // Información principal
            $table->string('title', 150);
            $table->text('description');

            // Estado y prioridad
            $table->string('status', 20)->default('open');
            $table->string('priority', 20)->default('green');

            // Establecimiento
            $table->string('company', 150);
            $table->string('address', 255);
            $table->string('category', 100);

            // Solicitante
            $table->string('requester_name', 150);
            $table->string('requester_email', 150);
            $table->string('requester_phone', 30);

            // Responsable interno
            $table->string('assigned_to', 150)->nullable();

            $table->timestamps();

            // Índices de consulta
            $table->index(
                ['status', 'created_at'],
                'incidents_status_date_idx'
            );

            $table->index(
                ['priority', 'created_at'],
                'incidents_priority_date_idx'
            );

            $table->index('created_at');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
