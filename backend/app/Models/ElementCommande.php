<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ElementCommande extends Model
{
    protected $table = 'elements_commande';

    protected $fillable = [
        'commande_id',
        'granola_id',
        'quantite',
        'prix_unitaire',
        'personnalisation'
    ];

    public function granola()
    {
        return $this->belongsTo(Granola::class);
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}