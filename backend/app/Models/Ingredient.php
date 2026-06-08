<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    protected $table = 'ingredients';

    protected $fillable = [
        'nom',
        'categorie',
        'modificateur_prix',
        'stock'
    ];

public function granolas()
{
    return $this->belongsToMany(
        Granola::class,
        'granola_ingredients'
    );
}


}