<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Granola extends Model
{
    protected $table = 'granolas';

    protected $fillable = [
        'nom',
        'description',
        'prix_base',
        'image',
        'est_actif'
    ];

    public function ingredients()
{
    return $this->belongsToMany(
        Ingredient::class,
        'granola_ingredients'
    )->withPivot('quantite');
}

public function elementsCommande()
{
    return $this->hasMany(ElementCommande::class);
}
}