# greenola
Application web de personnalisation de granola (Laravel + React)

# Description du projet
Greenola est une application web de personnalisation de granola développée avec Laravel (backend) et React (frontend).
Elle permet aux utilisateurs de créer leurs propres granolas en choisissant différents ingrédients, de passer des commandes et de suivre leur historique d’achats.

# Objectifs du projet
Développer une application web permettant aux utilisateurs de :
-Personnaliser leur propre granola.
-Ajouter des produits au panier.
-Passer et suivre leurs commandes.
-Faciliter la gestion des produits, ingrédients et commandes pour l’administrateur.

# Fonctionnalités principales
Côté utilisateur :
-Inscription et connexion
-Consultation des granolas disponibles
-Personnalisation des granolas 
-Gestion du panier
-Passage de commande
-Consultation de l’historique des commandes
Côté administrateur :
-Gestion des granolas (ajout, modification, suppression)
-Gestion des ingrédients
-Gestion des commandes
-Suivi des statuts des commandes

# Technologies utilisées
-Laravel (Backend)
-React (Frontend)
-MySQL (Base de données)
-REST API
-Git & GitHub
 
 # Installation du projet 
 1-cloner le projet :
 git clone https://github.com/guasoukaina2002-wq/greenola.git
 cd greenola

 2-Backend (Laravel) :
 cd backend
 composer install
 cp .env.example .env
 php artisan key:generate
 php artisan migrate
 php artisan serve 

 3-Frontend (React) :
 cd frontend
 npm install
 npm start

 4-Lancer le projet :
 Backend : http://127.0.0.1:8000
 Frontend : http://localhost:3000