document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loadingScreen');

    function hideLoadingScreen() {
        if (!loadingScreen || loadingScreen.classList.contains('hidden')) {
            return;
        }
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    window.addEventListener('load', hideLoadingScreen);

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

        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (cursor) {
                    cursor.style.transform = 'scale(1.5)';
                    cursor.style.borderColor = '#c9b8d4';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (cursor) {
                    cursor.style.transform = 'scale(1)';
                    cursor.style.borderColor = '#8b9bb4';
                }
            });
        });
    }

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

    async function trackVisitor() {
        const visitId = 'visit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
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

        const storageKey = `siteVisits_${window.location.hostname}`;
        const visits = JSON.parse(localStorage.getItem(storageKey) || '[]');
        visits.push(visitorData);
        if (visits.length > 100) {
            visits.shift();
        }
        localStorage.setItem(storageKey, JSON.stringify(visits));
        console.log('✅ Visite enregistrée localement:', visitorData);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }

        await sendToServer(visitorData);
    }

    async function sendToServer(data) {
        try {
            const config = await loadTrackingConfig();
            
            if (!config.enabled) {
                console.log('⚠️ Tracking désactivé');
                return;
            }

            if (config.webhookUrl && config.webhookUrl !== 'https://webhook.site/VOTRE-URL-UNIQUE') {
                try {
                    await fetch(config.webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: 'site_visit',
                            data: data,
                            received_at: new Date().toISOString()
                        }),
                        mode: 'no-cors'
                    });
                    console.log('✅ Données envoyées au webhook');
                } catch (error) {
                    console.log('⚠️ Erreur lors de l\'envoi au webhook:', error);
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

    async function loadTrackingConfig() {
        try {
            const response = await fetch('tracking-config.js');
            const text = await response.text();
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

    trackVisitor();

    const START_DATE = new Date('2025-01-12T04:00:00');
    const BREAKUP_DATE = new Date('2026-10-15T21:00:00');

    function splitDuration(start, end) {
        let timeDiff = end - start;
        if (timeDiff < 0) {
            timeDiff = 0;
        }

        return {
            days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((timeDiff % (1000 * 60)) / 1000)
        };
    }

    function setCounterValues(prefix, values, animate) {
        ['days', 'hours', 'minutes', 'seconds'].forEach((unit) => {
            const element = document.getElementById(`${prefix}-${unit}`);
            if (!element) return;
            const newValue = values[unit];
            const currentValue = parseInt(element.textContent, 10);

            if (currentValue !== newValue) {
                if (animate) {
                    element.classList.add('changing');
                }
                element.textContent = newValue;
                if (animate) {
                    setTimeout(() => {
                        element.classList.remove('changing');
                    }, 500);
                }
            }
        });
    }

    const sharedTime = splitDuration(START_DATE, BREAKUP_DATE);
    setCounterValues('shared', sharedTime, false);

    function updateSinceCounter() {
        const sinceTime = splitDuration(BREAKUP_DATE, new Date());
        setCounterValues('since', sinceTime, true);
    }

    updateSinceCounter();
    setInterval(updateSinceCounter, 1000);

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

    document.querySelectorAll('.letter, .gift-section, .love-counter, .personal-message').forEach(el => {
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
    const loveModal = document.getElementById('loveModal');
    const closeLoveModal = document.getElementById('closeLoveModal');

    function openLoveModal() {
        if (!loveModal) return;
        loveModal.hidden = false;
        requestAnimationFrame(() => {
            loveModal.classList.add('is-visible');
        });
    }

    function closeLoveModalFn() {
        if (!loveModal) return;
        loveModal.classList.remove('is-visible');
        setTimeout(() => {
            loveModal.hidden = true;
        }, 280);
    }

    if (closeLoveModal) {
        closeLoveModal.addEventListener('click', closeLoveModalFn);
    }

    if (loveModal) {
        loveModal.addEventListener('click', function(e) {
            if (e.target === loveModal) {
                closeLoveModalFn();
            }
        });
    }

    loveButton.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play().catch(function() {
                console.log("Lecture automatique bloquée par le navigateur");
            });
        }
        
        this.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        openLoveModal();
    });

    birthdayButton.addEventListener('click', function() {
        birthdaySection.style.display = 'flex';
        birthdaySection.style.opacity = '0';
        birthdaySection.style.transform = 'scale(0.8) rotate(-5deg)';
        
        setTimeout(() => {
            birthdaySection.style.opacity = '1';
            birthdaySection.style.transform = 'scale(1) rotate(0deg)';
        }, 50);
        
        createConfetti();
    });

    function createConfetti() {
        const colors = ['#8b9bb4', '#c9b8d4', '#d4af37', '#6b7c93', '#a89bb0'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 4000);
            }, i * 100);
        }
    }

    function closeBirthdaySection() {
        birthdaySection.style.opacity = '0';
        birthdaySection.style.transform = 'scale(0.8) rotate(5deg)';
        setTimeout(() => {
            birthdaySection.style.display = 'none';
        }, 300);
    }

    closeBirthday.addEventListener('click', function(e) {
        e.stopPropagation();
        closeBirthdaySection();
    });

    birthdaySection.addEventListener('click', function(e) {
        if (e.target === birthdaySection) {
            closeBirthdaySection();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && birthdaySection.style.display === 'flex') {
            closeBirthdaySection();
        }
        if (e.key === 'Escape' && loveModal && !loveModal.hidden) {
            closeLoveModalFn();
        }
    });

    birthdayButton.addEventListener('mouseenter', function() {
        this.style.animation = 'birthdayGlow 0.5s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
    });

    birthdayButton.addEventListener('mouseleave', function() {
        this.style.animation = 'birthdayGlow 2s ease-in-out infinite alternate';
    });

    birthdayButton.addEventListener('click', function() {
        this.style.animation = 'birthdayGlow 2s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
        setTimeout(() => {
            this.style.animation = 'birthdayGlow 2s ease-in-out infinite alternate';
        }, 600);
    });

    newYearButton.addEventListener('click', function() {
        newYearSection.style.display = 'flex';
        newYearSection.style.opacity = '0';
        newYearSection.style.transform = 'scale(0.8) rotate(-5deg)';
        
        setTimeout(() => {
            newYearSection.style.opacity = '1';
            newYearSection.style.transform = 'scale(1) rotate(0deg)';
        }, 50);
        
        createNewYearConfetti();
    });

    function createNewYearConfetti() {
        const colors = ['#d4af37', '#8b9bb4', '#4a5d78', '#c9b8d4', '#6b7c93'];
        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 4000);
            }, i * 80);
        }
    }

    function closeNewYearSection() {
        newYearSection.style.opacity = '0';
        newYearSection.style.transform = 'scale(0.8) rotate(5deg)';
        setTimeout(() => {
            newYearSection.style.display = 'none';
        }, 300);
    }

    closeNewYear.addEventListener('click', function(e) {
        e.stopPropagation();
        closeNewYearSection();
    });

    newYearSection.addEventListener('click', function(e) {
        if (e.target === newYearSection) {
            closeNewYearSection();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && newYearSection.style.display === 'flex') {
            closeNewYearSection();
        }
    });

    newYearButton.addEventListener('mouseenter', function() {
        this.style.animation = 'newYearGlow 0.5s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
    });

    newYearButton.addEventListener('mouseleave', function() {
        this.style.animation = 'newYearGlow 2s ease-in-out infinite alternate';
    });

    newYearButton.addEventListener('click', function() {
        this.style.animation = 'newYearGlow 2s ease-in-out infinite alternate, bounce 0.6s ease-in-out';
        setTimeout(() => {
            this.style.animation = 'newYearGlow 2s ease-in-out infinite alternate';
        }, 600);
    });
});
