# 📊 Guide de Configuration du Système de Tracking

Ce guide vous explique comment configurer le système de tracking pour voir **TOUTES** les visites sur votre site, même quand il est hébergé sur GitHub Pages.

## 🎯 Objectif

Le système permet de :
- ✅ Voir toutes les visites, même depuis GitHub Pages
- ✅ Connaître l'heure exacte de chaque visite
- ✅ Voir les informations du visiteur (navigateur, appareil, IP, etc.)
- ✅ Recevoir des notifications en temps réel

## 🚀 Configuration Rapide (5 minutes)

### Méthode 1 : Webhook.site (RECOMMANDÉ - Le plus simple)

1. **Allez sur [webhook.site](https://webhook.site)**
   - C'est un service gratuit et simple
   - Pas besoin de créer un compte

2. **Copiez l'URL unique**
   - Une URL unique vous sera générée automatiquement
   - Exemple : `https://webhook.site/abc123-def456-ghi789`

3. **Ouvrez le fichier `tracking-config.js`**
   - Remplacez `'https://webhook.site/VOTRE-URL-UNIQUE'` par votre URL
   - Exemple : `webhookUrl: 'https://webhook.site/abc123-def456-ghi789',`

4. **C'est tout !**
   - Toutes les visites seront maintenant enregistrées
   - Allez sur webhook.site pour voir les visites en temps réel
   - Chaque visite apparaîtra comme une nouvelle requête

### Méthode 2 : Formspree (Alternative)

1. **Allez sur [formspree.io](https://formspree.io)**
   - Créez un compte gratuit
   - Créez un nouveau formulaire

2. **Copiez l'URL du formulaire**
   - Exemple : `https://formspree.io/f/abc123def`

3. **Ouvrez `tracking-config.js`**
   - Remplacez `'https://formspree.io/f/VOTRE-FORM-ID'` par votre URL
   - Exemple : `formspreeUrl: 'https://formspree.io/f/abc123def',`

4. **Les données seront envoyées par email ou visibles dans votre dashboard**

### Méthode 3 : Votre propre serveur

Si vous avez votre propre serveur :

1. Créez un endpoint API qui accepte les requêtes POST
2. L'endpoint doit accepter du JSON avec les données de visite
3. Collez l'URL dans `customEndpoint` dans `tracking-config.js`

## 📋 Données Collectées

Pour chaque visite, le système enregistre :
- ✅ Date et heure exacte
- ✅ Navigateur utilisé (Chrome, Firefox, Safari, etc.)
- ✅ Type d'appareil (Desktop, Mobile, Tablet)
- ✅ Résolution d'écran
- ✅ Langue du navigateur
- ✅ Fuseau horaire
- ✅ Adresse IP (approximative)
- ✅ Page visitée
- ✅ Source (d'où vient le visiteur)
- ✅ Et plus encore...

## 🔍 Comment Voir les Visites

### Option 1 : Via Webhook.site

1. Allez sur [webhook.site](https://webhook.site)
2. Utilisez la même URL que celle configurée dans `tracking-config.js`
3. Toutes les visites apparaîtront en temps réel dans l'onglet "Requests"
4. Cliquez sur une requête pour voir tous les détails

### Option 2 : Via la Page Admin

1. Ouvrez `admin.html` dans votre navigateur
2. Cliquez sur "Actualiser les Données"
3. Toutes les visites seront affichées avec tous les détails

### Option 3 : Via Google Analytics

1. Allez sur [analytics.google.com](https://analytics.google.com)
2. Connectez-vous avec votre compte Google
3. ID de mesure : `G-1BP5PE9VNP`
4. Vous verrez toutes les statistiques détaillées

## 🛠️ Dépannage

### Le tracking ne fonctionne pas

1. Vérifiez que `enabled: true` dans `tracking-config.js`
2. Vérifiez que l'URL du webhook est correcte
3. Ouvrez la console du navigateur (F12) pour voir les erreurs
4. Vérifiez que le fichier `tracking-config.js` est bien chargé

### Je ne vois pas les visites sur webhook.site

1. Vérifiez que vous utilisez la bonne URL
2. Vérifiez que le site est bien en ligne (pas seulement en local)
3. Attendez quelques secondes, les requêtes peuvent prendre du temps

### Les données ne s'affichent pas dans admin.html

1. Cliquez sur "Actualiser les Données"
2. Vérifiez que vous avez sélectionné la bonne source (Toutes / Local / Serveur)
3. Les données locales sont toujours disponibles même sans webhook

## 📝 Notes Importantes

- ⚠️ **Webhook.site** : Les données sont visibles en temps réel mais ne sont pas stockées indéfiniment
- ⚠️ **Formspree** : Limite de 50 soumissions/mois en version gratuite
- ✅ **LocalStorage** : Les données locales sont toujours sauvegardées en backup
- ✅ **Google Analytics** : Fonctionne en parallèle pour une analyse complète

## 🎉 C'est Prêt !

Une fois configuré, vous pourrez voir **toutes** les visites sur votre site, même quand Amel visitera depuis son téléphone ou son ordinateur, peu importe où elle se trouve dans le monde !

---

**Besoin d'aide ?** Vérifiez la console du navigateur (F12) pour voir les messages de debug.

