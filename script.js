document.addEventListener('DOMContentLoaded', function() {
    // Animation de chargement
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // Curseur personnalisé (seulement sur desktop)
    const cursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (cursor && cursorFollower && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX - 4 + 'px';
                cursorFollower.style.top = e.clientY - 4 + 'px';
            }, 50);
        });

        // Effet au survol des boutons
        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (cursor) {
                    cursor.style.transform = 'scale(1.5)';
                    cursor.style.borderColor = '#ff1493';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (cursor) {
                    cursor.style.transform = 'scale(1)';
                    cursor.style.borderColor = '#ff69b4';
                }
            });
        });
    }

    // Créer des étoiles scintillantes
    function createStars() {
        const starsContainer = document.querySelector('.stars-background');
        if (!starsContainer) return;
        
        const starCount = 50;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (Math.random() * 2 + 2) + 's';
            starsContainer.appendChild(star);
        }
    }
    createStars();

    // Effets de particules au clic
    document.addEventListener('click', (e) => {
        const particles = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞'];
        const randomParticle = particles[Math.floor(Math.random() * particles.length)];
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'click-particle';
                particle.textContent = randomParticle;
                particle.style.left = e.clientX + (Math.random() - 0.5) * 50 + 'px';
                particle.style.top = e.clientY + (Math.random() - 0.5) * 50 + 'px';
                particle.style.animationDelay = (i * 0.1) + 's';
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }, i * 100);
        }
    });

    // Système de suivi des visiteurs complet
    async function trackVisitor() {
        // Générer un ID unique pour cette visite
        const visitId = 'visit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Récupérer l'IP (approximative via service externe)
        let ipAddress = 'Unknown';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            ipAddress = ipData.ip;
        } catch (e) {
            console.log('Impossible de récupérer l\'IP');
        }

        const visitorData = {
            visitId: visitId,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
            userAgent: navigator.userAgent,
            browser: getBrowserName(),
            device: getDeviceType(),
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: document.referrer || 'direct',
            pageUrl: window.location.href,
            domain: window.location.hostname,
            ipAddress: ipAddress,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            online: navigator.onLine
        };

        // 1. Enregistrer localement (backup)
        const storageKey = `siteVisits_${window.location.hostname}`;
        const visits = JSON.parse(localStorage.getItem(storageKey) || '[]');
        visits.push(visitorData);
        // Garder seulement les 100 dernières visites locales
        if (visits.length > 100) {
            visits.shift();
        }
        localStorage.setItem(storageKey, JSON.stringify(visits));
        console.log('✅ Visite enregistrée localement:', visitorData);

        // 2. Envoyer à Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }

        // 3. Envoyer au serveur/webhook (pour GitHub Pages)
        await sendToServer(visitorData);
    }

    // Fonction pour envoyer les données au serveur
    async function sendToServer(data) {
        try {
            // Charger la configuration
            const config = await loadTrackingConfig();
            
            if (!config.enabled) {
                console.log('⚠️ Tracking désactivé');
                return;
            }

            // Essayer d'envoyer au webhook
            if (config.webhookUrl && config.webhookUrl !== 'https://webhook.site/VOTRE-URL-UNIQUE') {
                try {
                    const response = await fetch(config.webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: 'site_visit',
                            data: data,
                            received_at: new Date().toISOString()
                        }),
                        mode: 'no-cors' // Pour éviter les problèmes CORS
                    });
                    console.log('✅ Données envoyées au webhook');
                } catch (error) {
                    console.log('⚠️ Erreur lors de l\'envoi au webhook:', error);
                    // Essayer avec Formspree en backup
                    if (config.formspreeUrl) {
                        await sendToFormspree(data, config.formspreeUrl);
                    }
                }
            } else if (config.formspreeUrl && config.formspreeUrl !== 'https://formspree.io/f/VOTRE-FORM-ID') {
                await sendToFormspree(data, config.formspreeUrl);
            } else if (config.customEndpoint && config.customEndpoint !== 'https://votre-serveur.com/api/track') {
                await sendToCustomEndpoint(data, config.customEndpoint);
            } else {
                console.log('⚠️ Aucune URL de tracking configurée. Voir tracking-config.js pour les instructions.');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi des données:', error);
        }
    }

    // Fonction pour charger la configuration
    async function loadTrackingConfig() {
        try {
            // Essayer de charger depuis le fichier de config
            const response = await fetch('tracking-config.js');
            const text = await response.text();
            // Extraire la configuration (méthode simple)
            const webhookMatch = text.match(/webhookUrl:\s*['"]([^'"]+)['"]/);
            const formspreeMatch = text.match(/formspreeUrl:\s*['"]([^'"]+)['"]/);
            const customMatch = text.match(/customEndpoint:\s*['"]([^'"]+)['"]/);
            const enabledMatch = text.match(/enabled:\s*(true|false)/);
            
            return {
                webhookUrl: webhookMatch ? webhookMatch[1] : null,
                formspreeUrl: formspreeMatch ? formspreeMatch[1] : null,
                customEndpoint: customMatch ? customMatch[1] : null,
                enabled: enabledMatch ? enabledMatch[1] === 'true' : true
            };
        } catch (error) {
            console.log('⚠️ Impossible de charger la configuration, utilisation des valeurs par défaut');
            return {
                webhookUrl: null,
                formspreeUrl: null,
                customEndpoint: null,
                enabled: true
            };
        }
    }

    // Envoyer à Formspree
    async function sendToFormspree(data, url) {
        try {
            const formData = new FormData();
            formData.append('visitId', data.visitId);
            formData.append('timestamp', data.timestamp);
            formData.append('date', data.date);
            formData.append('userAgent', data.userAgent);
            formData.append('browser', data.browser);
            formData.append('device', data.device);
            formData.append('language', data.language);
            formData.append('screenResolution', data.screenResolution);
            formData.append('timezone', data.timezone);
            formData.append('referrer', data.referrer);
            formData.append('pageUrl', data.pageUrl);
            formData.append('domain', data.domain);
            formData.append('ipAddress', data.ipAddress);
            
            await fetch(url, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });
            console.log('✅ Données envoyées à Formspree');
        } catch (error) {
            console.log('⚠️ Erreur Formspree:', error);
        }
    }

    // Envoyer à un endpoint personnalisé
    async function sendToCustomEndpoint(data, url) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            console.log('✅ Données envoyées à l\'endpoint personnalisé');
        } catch (error) {
            console.log('⚠️ Erreur endpoint personnalisé:', error);
        }
    }

    // Fonctions utilitaires
    function getBrowserName() {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
        return 'Unknown';
    }

    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android|android 3.0|xoom|sch-i800|playbook|silk/i.test(ua)) return 'Mobile';
        return 'Desktop';
    }



    // Enregistrer la visite
    trackVisitor();

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

    // Démarrer le compteur avec animation
    updateLoveCounter();
    setInterval(updateLoveCounter, 1000);

    // Animation de typing pour le titre (optionnel)
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Animation au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    // Observer les éléments pour l'animation au scroll
    document.querySelectorAll('.letter, .gift-section, .love-counter').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    const loveButton = document.getElementById('loveButton');
    const birthdayButton = document.getElementById('birthdayButton');
    const newYearButton = document.getElementById('newYearButton');
    const birthdaySection = document.getElementById('birthdaySection');
    const newYearSection = document.getElementById('newYearSection');
    const closeBirthday = document.getElementById('closeBirthday');
    const closeNewYear = document.getElementById('closeNewYear');
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

    // Gestion du bouton de bonne année
    newYearButton.addEventListener('click', function() {
        // Animation d'entrée
        newYearSection.style.display = 'flex';
        newYearSection.style.opacity = '0';
        newYearSection.style.transform = 'scale(0.8) rotate(-5deg)';
        
        setTimeout(() => {
            newYearSection.style.opacity = '1';
            newYearSection.style.transform = 'scale(1) rotate(0deg)';
        }, 50);
        
        // Ajouter des confettis dorés pour la nouvelle année
        createNewYearConfetti();
    });

    // Fonction pour créer des confettis de nouvelle année (dorés et bleus)
    function createNewYearConfetti() {
        const colors = ['#ffd700', '#ffed4e', '#4a90e2', '#87ceeb', '#ff6b6b', '#ffa500'];
        for (let i = 0; i < 60; i++) {
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
            }, i * 80);
        }
    }

    // Fermer la section de bonne année avec animation
    function closeNewYearSection() {
        newYearSection.style.opacity = '0';
        newYearSection.style.transform = 'scale(0.8) rotate(5deg)';
        setTimeout(() => {
            newYearSection.style.display = 'none';
        }, 300);
    }

    // Fermer la section de bonne année
    closeNewYear.addEventListener('click', function(e) {
        e.stopPropagation();
        closeNewYearSection();
    });

    // Fermer en cliquant en dehors du contenu
    newYearSection.addEventListener('click', function(e) {
        if (e.target === newYearSection) {
            closeNewYearSection();
        }
    });

    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && newYearSection.style.display === 'flex') {
            closeNewYearSection();
        }
    });

    // Animation spéciale pour le bouton de bonne année
    newYearButton.addEventListener('mouseenter', function() {
        this.style.animation = 'newYearGlow 0.5s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
    });

    newYearButton.addEventListener('mouseleave', function() {
        this.style.animation = 'newYearGlow 2s ease-in-out infinite alternate';
    });

    // Animation de rebond pour le bouton de bonne année
    newYearButton.addEventListener('click', function() {
        this.style.animation = 'newYearGlow 2s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
        setTimeout(() => {
            this.style.animation = 'newYearGlow 2s ease-in-out infinite alternate';
        }, 600);
    });
}); 