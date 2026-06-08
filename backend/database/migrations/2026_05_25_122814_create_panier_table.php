<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('panier', function (Blueprint $table) {
       $table->id();
       $table->foreignId('user_id')->constrained()->cascadeOnDelete();
       $table->foreignId('granola_id')->constrained()->cascadeOnDelete();
       $table->integer('quantite')->default(1);
       $table->json('personnalisation')->nullable();
       $table->timestamps();
     });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('panier');
    }
};
