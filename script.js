document.addEventListener('DOMContentLoaded', function() {
    const music = document.getElementById('backgroundMusic');
    const loveButton = document.getElementById('loveButton');
    let isPlaying = false;

    // Fonction pour créer un cœur
    function createHeart() {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = '-20px';
        heart.style.fontSize = Math.random() * 20 + 10 + 'px';
        heart.style.opacity = Math.random() * 0.5 + 0.5;
        heart.style.zIndex = '1000';
        heart.style.transition = 'transform 3s linear';
        document.body.appendChild(heart);

        // Forcer un reflow pour que l'animation fonctionne
        heart.offsetHeight;

        // Animer le cœur
        heart.style.transform = `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`;

        // Supprimer le cœur après l'animation
        setTimeout(() => {
            heart.remove();
        }, 3000);
    }

    // Gérer le clic sur le bouton
    loveButton.addEventListener('click', function() {
        if (!isPlaying) {
            music.play();
            isPlaying = true;
        }

        // Créer plusieurs cœurs
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                createHeart();
            }, i * 100);
        }
    });

    // Démarrer la musique automatiquement au chargement de la page
    document.addEventListener('click', function() {
        if (!isPlaying) {
            music.play();
            isPlaying = true;
        }
    }, { once: true });
}); 