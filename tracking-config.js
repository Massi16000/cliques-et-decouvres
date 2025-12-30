// Configuration du système de tracking
// Remplacez cette URL par votre webhook URL (voir instructions ci-dessous)

const TRACKING_CONFIG = {
    // Option 1: Webhook.site (gratuit et simple)
    // 1. Allez sur https://webhook.site
    // 2. Copiez l'URL unique qui vous est donnée
    // 3. Collez-la ci-dessous
    webhookUrl: 'https://webhook.site/f0f38b14-b7e6-48cb-8a96-94f7f263abc2',
    
    // Option 2: Formspree (alternative)
    // formspreeUrl: 'https://formspree.io/f/VOTRE-FORM-ID',
    
    // Option 3: Votre propre endpoint
    // customEndpoint: 'https://votre-serveur.com/api/track',
    
    // Activer/désactiver le tracking
    enabled: true,
    
    // Délai avant d'envoyer (pour éviter les spams)
    sendDelay: 1000
};

// Instructions pour configurer le tracking:
// 
// MÉTHODE 1 - Webhook.site (RECOMMANDÉ - Le plus simple)
// 1. Allez sur https://webhook.site
// 2. Une URL unique vous sera générée (ex: https://webhook.site/abc123-def456-...)
// 3. Copiez cette URL et collez-la dans 'webhookUrl' ci-dessus
// 4. Toutes les visites seront visibles sur webhook.site dans l'onglet "Requests"
// 5. Vous pouvez voir toutes les données en temps réel!
//
// MÉTHODE 2 - Formspree (Alternative)
// 1. Allez sur https://formspree.io
// 2. Créez un compte gratuit
// 3. Créez un nouveau formulaire
// 4. Copiez l'URL du formulaire et collez-la dans 'formspreeUrl'
// 5. Les données seront envoyées par email ou visibles dans votre dashboard
//
// MÉTHODE 3 - Votre propre serveur
// 1. Créez un endpoint API sur votre serveur
// 2. L'endpoint doit accepter des requêtes POST avec les données JSON
// 3. Collez l'URL dans 'customEndpoint'
//
// NOTE: Pour voir les données dans admin.html, vous devrez récupérer les données
// depuis votre service. Webhook.site permet de voir les requêtes en temps réel.

