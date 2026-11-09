
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('incident_id')
                ->constrained('incidents')
                ->restrictOnDelete();

            // Acción realizada
            $table->string('action', 50);

            // Valores anteriores y nuevos
            $table->string('old_value')->nullable();
            $table->string('new_value')->nullable();

            // Actor que realiza el cambio
            $table->string('user_name', 150);

            // Información adicional
            $table->json('metadata')->nullable();

            // Fecha del evento
            $table->timestamp('created_at')->useCurrent();

            $table->index(
                ['incident_id', 'created_at'],
                'incident_logs_incident_date_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_logs');
    }
};
