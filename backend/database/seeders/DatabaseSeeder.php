<?php

namespace Database\Seeders;

use App\Models\Commande;
use App\Models\ElementCommande;
use App\Models\Granola;
use App\Models\Ingredient;
use App\Models\Panier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Utilisateurs ───────────────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Administrateur',
            'email'    => 'admin@granola.com',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
        ]);

        $user = User::create([
            'name'     => 'Client Test',
            'email'    => 'user@granola.com',
            'password' => Hash::make('user123'),
            'role'     => 'user',
        ]);

        // ─── Ingrédients ─────────────────────────────────────────────────────────
        $ingredients = [
            // Bases (prix en DH)
            ['nom' => 'Avoine sans gluten',    'categorie' => 'base',     'modificateur_prix' => 0,  'stock' => 100],
            ['nom' => 'Épeautre soufflé',      'categorie' => 'base',     'modificateur_prix' => 4,  'stock' => 80],
            ['nom' => 'Sarrasin soufflé',      'categorie' => 'base',     'modificateur_prix' => 6,  'stock' => 60],
            // Fruits secs
            ['nom' => 'Amandes effilées',      'categorie' => 'fruit',    'modificateur_prix' => 8,  'stock' => 90],
            ['nom' => 'Noix de coco râpée',    'categorie' => 'fruit',    'modificateur_prix' => 6,  'stock' => 70],
            ['nom' => 'Bananes séchées',       'categorie' => 'fruit',    'modificateur_prix' => 6,  'stock' => 60],
            ['nom' => 'Raisins secs dorés',    'categorie' => 'fruit',    'modificateur_prix' => 5,  'stock' => 80],
            ['nom' => 'Cranberries séchées',   'categorie' => 'fruit',    'modificateur_prix' => 7,  'stock' => 50],
            // Chocolat
            ['nom' => 'Pépites chocolat noir', 'categorie' => 'chocolat', 'modificateur_prix' => 10, 'stock' => 70],
            ['nom' => 'Pépites chocolat lait', 'categorie' => 'chocolat', 'modificateur_prix' => 8,  'stock' => 65],
            ['nom' => 'Pépites chocolat blanc','categorie' => 'chocolat', 'modificateur_prix' => 9,  'stock' => 55],
            // Graines
            ['nom' => 'Graines de chia',       'categorie' => 'graine',   'modificateur_prix' => 5,  'stock' => 90],
            ['nom' => 'Graines de courge',     'categorie' => 'graine',   'modificateur_prix' => 6,  'stock' => 80],
            ['nom' => 'Graines de tournesol',  'categorie' => 'graine',   'modificateur_prix' => 4,  'stock' => 100],
            ['nom' => 'Graines de lin',        'categorie' => 'graine',   'modificateur_prix' => 5,  'stock' => 75],
            // Sucrants
            ['nom' => "Miel d'Acacia",         'categorie' => 'sucrant',  'modificateur_prix' => 7,  'stock' => 60],
            ['nom' => "Sirop d'Érable",        'categorie' => 'sucrant',  'modificateur_prix' => 9,  'stock' => 50],
            ['nom' => 'Sucre de coco',         'categorie' => 'sucrant',  'modificateur_prix' => 6,  'stock' => 70],
        ];

        foreach ($ingredients as $ing) {
            Ingredient::create($ing);
        }

        // ─── Granolas standards ──────────────────────────────────────────────────
        $choco = Granola::create([
            'nom'         => 'Choco-Amande',
            'description' => 'Un granola généreux alliant la douceur des amandes grillées et l\'intensité du chocolat noir, lié au miel d\'acacia.',
            'prix_base'   => 14,
            'image'       => '/images/choco_amande.png',
            'est_actif'   => true,
        ]);
        $choco->ingredients()->attach([
            1 => ['quantite' => 60],  // Avoine sans gluten
            4 => ['quantite' => 15],  // Amandes effilées
            9 => ['quantite' => 10],  // Pépites chocolat noir
           13 => ['quantite' => 5],   // Graines de courge
           16 => ['quantite' => 10],  // Miel d'Acacia
        ]);

        $coco = Granola::create([
            'nom'         => 'Coco-Banane Gourmand',
            'description' => 'Une escapade tropicale avec la noix de coco, les bananes séchées et la légèreté du sirop d\'érable.',
            'prix_base'   => 15,
            'image'       => '/images/fruit_granola.png',
            'est_actif'   => true,
        ]);
        $coco->ingredients()->attach([
            1 => ['quantite' => 55],  // Avoine sans gluten
            5 => ['quantite' => 15],  // Noix de coco râpée
            6 => ['quantite' => 10],  // Bananes séchées
           12 => ['quantite' => 5],   // Graines de chia
           17 => ['quantite' => 15],  // Sirop d'Érable
        ]);

        $miel = Granola::create([
            'nom'         => 'Miel & Épeautre',
            'description' => 'La recette traditionnelle : base d\'épeautre croustillante, raisins secs dorés, graines de tournesol et miel pur.',
            'prix_base'   => 12,
            'image'       => '/images/fruit_granola.png',
            'est_actif'   => true,
        ]);
        $miel->ingredients()->attach([
            2 => ['quantite' => 60],  // Épeautre soufflé
            7 => ['quantite' => 15],  // Raisins secs dorés
           14 => ['quantite' => 10],  // Graines de tournesol
           16 => ['quantite' => 15],  // Miel d'Acacia
        ]);

        $berry = Granola::create([
            'nom'         => 'Rouge & Sarrasin',
            'description' => 'Audacieux et vitaminé : sarrasin soufflé, cranberries, pépites chocolat blanc et sirop d\'érable.',
            'prix_base'   => 17,
            'image'       => '/images/fruit_granola.png',
            'est_actif'   => true,
        ]);
        $berry->ingredients()->attach([
            3 => ['quantite' => 55],  // Sarrasin soufflé
            8 => ['quantite' => 15],  // Cranberries séchées
           11 => ['quantite' => 10],  // Pépites chocolat blanc
           15 => ['quantite' => 5],   // Graines de lin
           17 => ['quantite' => 15],  // Sirop d'Érable
        ]);
    }
}
