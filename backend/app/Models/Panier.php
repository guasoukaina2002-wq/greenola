<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Panier extends Model
{
    protected $table = 'panier';

    protected $fillable = [
        'user_id',
        'granola_id',
        'quantite',
        'personnalisation',
    ];

    public function granola()
    {
        return $this->belongsTo(Granola::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
