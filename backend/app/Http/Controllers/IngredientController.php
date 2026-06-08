<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    /** Liste tous les ingrédients groupés par catégorie (public) */
    public function index()
    {
        $ingredients = Ingredient::all()->groupBy('categorie');
        return response()->json($ingredients);
    }

    /** [Admin] Créer un ingrédient */
    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'nom'               => 'required|string|max:255',
            'categorie'         => 'required|in:base,fruit,chocolat,graine,sucrant',
            'modificateur_prix' => 'required|numeric|min:0',
            'stock'             => 'required|integer|min:0',
        ]);

        $ingredient = Ingredient::create($data);
        return response()->json($ingredient, 201);
    }

    /** [Admin] Modifier un ingrédient */
    public function update(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $ingredient = Ingredient::findOrFail($id);

        $data = $request->validate([
            'nom'               => 'sometimes|string|max:255',
            'categorie'         => 'sometimes|in:base,fruit,chocolat,graine,sucrant',
            'modificateur_prix' => 'sometimes|numeric|min:0',
            'stock'             => 'sometimes|integer|min:0',
        ]);

        $ingredient->update($data);
        return response()->json($ingredient);
    }

    /** [Admin] Supprimer un ingrédient */
    public function destroy(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $ingredient = Ingredient::findOrFail($id);
        $ingredient->delete();

        return response()->json(['message' => 'Ingrédient supprimé']);
    }

    private function authorizeAdmin(Request $request)
    {
        if (!$request->user() || !$request->user()->estAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }
}
