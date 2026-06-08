<?php

namespace App\Http\Controllers;

use App\Models\Panier;
use App\Models\Granola;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /** Récupérer le panier de l'utilisateur connecté */
    public function index(Request $request)
    {
        $panier = Panier::where('user_id', $request->user()->id)
            ->with('granola')
            ->get()
            ->map(function ($item) {
                // Décoder la personnalisation JSON stockée
                $item->personnalisation = $item->personnalisation
                    ? json_decode($item->personnalisation, true)
                    : null;
                return $item;
            });

        return response()->json($panier);
    }

    /** Ajouter un granola (standard ou personnalisé) au panier */
    public function store(Request $request)
    {
        $data = $request->validate([
            'granola_id'      => 'required|exists:granolas,id',
            'quantite'        => 'required|integer|min:1',
            'personnalisation' => 'nullable|array',
        ]);

        // Vérifier que le granola est actif
        $granola = Granola::where('id', $data['granola_id'])
            ->where('est_actif', true)
            ->firstOrFail();

        $item = Panier::create([
            'user_id'         => $request->user()->id,
            'granola_id'      => $data['granola_id'],
            'quantite'        => $data['quantite'],
            'personnalisation' => isset($data['personnalisation'])
                ? json_encode($data['personnalisation'])
                : null,
        ]);

        return response()->json($item->load('granola'), 201);
    }

    /** Modifier la quantité d'un élément du panier */
    public function update(Request $request, $id)
    {
        $item = Panier::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $data = $request->validate([
            'quantite' => 'required|integer|min:1',
        ]);

        $item->update($data);

        return response()->json($item->load('granola'));
    }

    /** Supprimer un élément du panier */
    public function destroy(Request $request, $id)
    {
        $item = Panier::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $item->delete();

        return response()->json(['message' => 'Article retiré du panier']);
    }

    /** Vider tout le panier */
    public function clear(Request $request)
    {
        Panier::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Panier vidé']);
    }
}
