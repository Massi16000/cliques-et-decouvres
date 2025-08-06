document.addEventListener('DOMContentLoaded', function() {
    // Compteur de temps d'amour
    function updateLoveCounter() {
        const startDate = new Date('2025-01-12T04:00:00');
        const now = new Date();
        const timeDiff = now - startDate;

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        // Mise à jour des éléments avec animation
        updateCounterElement('days', days);
        updateCounterElement('hours', hours);
        updateCounterElement('minutes', minutes);
        updateCounterElement('seconds', seconds);
    }

    function updateCounterElement(id, newValue) {
        const element = document.getElementById(id);
        const currentValue = parseInt(element.textContent);
        
        if (currentValue !== newValue) {
            element.classList.add('changing');
            element.textContent = newValue;
            
            setTimeout(() => {
                element.classList.remove('changing');
            }, 500);
        }
    }

    // Démarrer le compteur
    updateLoveCounter();
    setInterval(updateLoveCounter, 1000);

    const loveButton = document.getElementById('loveButton');
    const birthdayButton = document.getElementById('birthdayButton');
    const birthdaySection = document.getElementById('birthdaySection');
    const closeBirthday = document.getElementById('closeBirthday');
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Gestion du bouton d'amour
    loveButton.addEventListener('click', function() {
        // Jouer la musique si elle n'est pas déjà en cours
        if (backgroundMusic.paused) {
            backgroundMusic.play().catch(function(error) {
                console.log("Lecture automatique bloquée par le navigateur");
            });
        }
        
        // Animation du bouton
        this.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        // Message de confirmation
        alert('Je t\'aime aussi mon bébé ❤️');
    });

    // Gestion du bouton d'anniversaire
    birthdayButton.addEventListener('click', function() {
        // Animation d'entrée plus originale
        birthdaySection.style.display = 'flex';
        birthdaySection.style.opacity = '0';
        birthdaySection.style.transform = 'scale(0.8) rotate(-5deg)';
        
        setTimeout(() => {
            birthdaySection.style.opacity = '1';
            birthdaySection.style.transform = 'scale(1) rotate(0deg)';
        }, 50);
        
        // Ajouter des confettis virtuels
        createConfetti();
    });

    // Fonction pour créer des confettis
    function createConfetti() {
        const colors = ['#ff69b4', '#ffd700', '#ff1493', '#ffa500', '#ff6347'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(confetti);
                
                // Supprimer le confetti après l'animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 4000);
            }, i * 100);
        }
    }

    // Fermer la section d'anniversaire avec animation
    function closeBirthdaySection() {
        birthdaySection.style.opacity = '0';
        birthdaySection.style.transform = 'scale(0.8) rotate(5deg)';
        setTimeout(() => {
            birthdaySection.style.display = 'none';
        }, 300);
    }

    // Fermer la section d'anniversaire
    closeBirthday.addEventListener('click', function(e) {
        e.stopPropagation();
        closeBirthdaySection();
    });

    // Fermer en cliquant en dehors du contenu
    birthdaySection.addEventListener('click', function(e) {
        if (e.target === birthdaySection) {
            closeBirthdaySection();
        }
    });

    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && birthdaySection.style.display === 'flex') {
            closeBirthdaySection();
        }
    });

    // Animation spéciale pour le bouton d'anniversaire
    birthdayButton.addEventListener('mouseenter', function() {
        this.style.animation = 'birthdayGlow 0.5s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
    });

    birthdayButton.addEventListener('mouseleave', function() {
        this.style.animation = 'birthdayGlow 2s ease-in-out infinite alternate';
    });

    // Animation de rebond pour le bouton
    birthdayButton.addEventListener('click', function() {
        this.style.animation = 'birthdayGlow 2s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
        setTimeout(() => {
            this.style.animation = 'birthdayGlow 2s ease-in-out infinite alternate';
        }, 600);
    });
}); 