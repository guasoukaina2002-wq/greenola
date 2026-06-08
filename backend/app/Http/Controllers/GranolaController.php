<?php

namespace App\Http\Controllers;

use App\Models\Granola;
use Illuminate\Http\Request;

class GranolaController extends Controller
{
    /** Liste des granolas actifs (public) */
    public function index()
    {
        $granolas = Granola::where('est_actif', true)
            ->with('ingredients')
            ->get();

        return response()->json($granolas);
    }

    /** Détails d'un granola avec ses ingrédients */
    public function show($id)
    {
        $granola = Granola::with('ingredients')->findOrFail($id);
        return response()->json($granola);
    }

    /** [Admin] Créer un nouveau granola */
    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix_base'   => 'required|numeric|min:0',
            'image'       => 'nullable|string',
            'est_actif'   => 'boolean',
        ]);

        $granola = Granola::create($data);

        return response()->json($granola, 201);
    }

    /** [Admin] Modifier un granola */
    public function update(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $granola = Granola::findOrFail($id);

        $data = $request->validate([
            'nom'         => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'prix_base'   => 'sometimes|numeric|min:0',
            'image'       => 'nullable|string',
            'est_actif'   => 'boolean',
        ]);

        $granola->update($data);

        return response()->json($granola);
    }

    /** [Admin] Supprimer un granola */
    public function destroy(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $granola = Granola::findOrFail($id);
        $granola->delete();

        return response()->json(['message' => 'Granola supprimé']);
    }

    private function authorizeAdmin(Request $request)
    {
        if (!$request->user() || !$request->user()->estAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }
    }
}
