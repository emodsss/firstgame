# Neon Drift

**Neon Drift** est un mini jeu d'arcade nerveux inspiré des néons rétro-futuristes.
Prenez le contrôle d'un vaisseau lumineux, capturez des orbes d'énergie et déclenchez
votre dash éclair pour survivre le plus longtemps possible.

## Aperçu du gameplay
- **Combo scoring** : enchaînez les orbes pour multiplier vos points.
- **Dash éclairs** : utilisez la barre espace pour traverser les champs de glitchs.
- **Glitch hazards** : évitez les obstacles instables qui drainent votre énergie.
- **HUD réactif** : surveillez votre énergie, votre score et vos vies en temps réel.

## Prérequis
Aucun outil spécifique n'est requis. Un navigateur moderne (Chrome, Firefox, Edge ou Safari)
suffit pour lancer le jeu. Si vous souhaitez servir le jeu depuis un serveur local, assurez-vous
d'avoir Python 3 installé.

## Lancer le jeu
### Option rapide
1. Téléchargez ou clonez ce dépôt.
2. Ouvrez directement le fichier `index.html` dans votre navigateur.

### Option serveur local
1. Ouvrez un terminal dans le dossier du projet :
   ```bash
   cd firstgame
   ```
2. Démarrez un serveur HTTP simple (exemple avec Python 3) :
   ```bash
   python3 -m http.server 8000
   ```
3. Rendez-vous sur <http://localhost:8000> dans votre navigateur et cliquez sur **Play**.

## Vérifier que tout fonctionne
1. Déplacez le vaisseau avec les flèches gauche/droite.
2. Maintenez **Espace** pour déclencher le dash et observez la jauge d'énergie.
3. Attrapez des orbes pour augmenter votre score et évitez les glitchs qui retirent des points de vie.
4. Testez le bouton **Rejouer** pour réinitialiser une partie en cours.

## Contrôles
| Action | Commande |
| --- | --- |
| Déplacer le vaisseau | Flèche gauche / Flèche droite |
| Dash éclair & relancer une partie | Barre espace |
| Redémarrer instantanément | Bouton « Rejouer » |

## Ressources
- `index.html` : structure du jeu et éléments de l'interface.
- `style.css` : thème néon/glassmorphism et adaptation responsive.
- `script.js` : boucle de jeu, gestion des collisions, HUD et effets de particules.

Bon jeu ! ✨
