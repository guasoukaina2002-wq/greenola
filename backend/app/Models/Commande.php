<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $table = 'commandes';

    protected $fillable = [
        'user_id',
        'prix_total',
        'statut',
        'notes'
    ];

    public function user()
   {
    return $this->belongsTo(User::class);
   }
    public function elementsCommande()
   {
    return $this->hasMany(ElementCommande::class);
  }
}