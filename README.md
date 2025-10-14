# Neon Drift

Mini jeu d'arcade réalisé en HTML5/CSS/JS. Attrape les orbes d'énergie,
esquive les glitchs et déclenche des dash éclair pour maximiser ton score.

## Démarrage

Ouvre simplement le fichier `index.html` dans un navigateur moderne ou lance un
serveur statique local, par exemple :

```bash
npx serve
```

Ensuite rends-toi sur <http://localhost:3000> (ou le port indiqué) pour jouer.

### Vérifier que tout fonctionne

1. Lance le serveur local :

   ```bash
   python3 -m http.server 8000
   ```

2. Ouvre <http://localhost:8000> dans ton navigateur.
3. Clique sur **Play** pour démarrer une partie et vérifie que :
   - Le vaisseau répond aux flèches gauche/droite.
   - La barre d'énergie se vide pendant un dash (barre espace) puis se recharge.
   - Le score augmente quand tu récupères des orbes et que les glitchs font perdre des points de vie.
4. Clique sur **Rejouer** pour relancer la partie et t'assurer que l'état est bien réinitialisé.

## Contrôles

- Flèches gauche/droite : déplacer le vaisseau
- Barre espace : dash éclair (aussi pour relancer une partie)
- Bouton « Rejouer » : réinitialise immédiatement la manche
