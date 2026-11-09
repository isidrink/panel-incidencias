
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_comments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('incident_id')
                ->constrained('incidents')
                ->restrictOnDelete();

            $table->string('author_name', 150);
            $table->text('body');

            $table->timestamps();

            $table->index(
                ['incident_id', 'created_at'],
                'incident_comments_incident_date_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_comments');
    }
};
