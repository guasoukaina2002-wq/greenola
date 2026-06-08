<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\ElementCommande;
use App\Models\Granola;
use App\Models\Ingredient;
use App\Models\Panier;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /** [Client] Historique des commandes de l'utilisateur */
    public function index(Request $request)
    {
        $commandes = Commande::where('user_id', $request->user()->id)
            ->with('elementsCommande.granola')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($commandes);
    }

    /** [Client] Valider le panier et créer une commande */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $panierItems = Panier::where('user_id', $userId)
            ->with('granola')
            ->get();

        if ($panierItems->isEmpty()) {
            return response()->json(['message' => 'Votre panier est vide.'], 422);
        }

        // Calculer le prix total
        $prixTotal = 0;
        foreach ($panierItems as $item) {
            $prixUnitaire = $item->granola->prix_base;

            // Ajouter le coût des ingrédients personnalisés
            $perso = $item->personnalisation ? json_decode($item->personnalisation, true) : null;
            if ($perso && isset($perso['ingredients'])) {
                $ids = collect($perso['ingredients'])->pluck('id');
                $extras = Ingredient::whereIn('id', $ids)->sum('modificateur_prix');
                $prixUnitaire += $extras;
            }

            // Majoration taille (en DH)
            if ($perso && isset($perso['taille'])) {
                $prixUnitaire += match ($perso['taille']) {
                    '500g'  => 10,
                    '750g'  => 20,
                    '1kg'   => 33,
                    default => 0,
                };
            }

            $prixTotal += $prixUnitaire * $item->quantite;
        }

        // Créer la commande
        $commande = Commande::create([
            'user_id'    => $userId,
            'prix_total' => round($prixTotal, 2),
            'statut'     => 'en_attente',
        ]);

        // Créer les éléments de commande
        foreach ($panierItems as $item) {
            $prixUnitaire = $item->granola->prix_base;
            $perso = $item->personnalisation ? json_decode($item->personnalisation, true) : null;

            if ($perso && isset($perso['ingredients'])) {
                $ids = collect($perso['ingredients'])->pluck('id');
                $extras = Ingredient::whereIn('id', $ids)->sum('modificateur_prix');
                $prixUnitaire += $extras;
            }
            if ($perso && isset($perso['taille'])) {
                $prixUnitaire += match ($perso['taille']) {
                    '500g'  => 10,
                    '750g'  => 20,
                    '1kg'   => 33,
                    default => 0,
                };
            }

            ElementCommande::create([
                'commande_id'     => $commande->id,
                'granola_id'      => $item->granola_id,
                'quantite'        => $item->quantite,
                'prix_unitaire'   => round($prixUnitaire, 2),
                'personnalisation' => $item->personnalisation,
            ]);
        }

        // Vider le panier
        Panier::where('user_id', $userId)->delete();

        return response()->json($commande->load('elementsCommande.granola'), 201);
    }

    /** [Admin] Liste de toutes les commandes */
    public function allOrders(Request $request)
    {
        if (!$request->user()->estAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }

        $commandes = Commande::with('user', 'elementsCommande.granola')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($commandes);
    }

    /** [Admin] Changer le statut d'une commande */
    public function updateStatus(Request $request, $id)
    {
        if (!$request->user()->estAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }

        $commande = Commande::findOrFail($id);

        $data = $request->validate([
            'statut' => 'required|in:en_attente,confirmee,en_preparation,expediee,livree,annulee',
        ]);

        $commande->update($data);

        return response()->json($commande);
    }
}
