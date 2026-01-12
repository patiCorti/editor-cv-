class CVViewer {
    constructor() {
        this.cvData = null;
    }

    loadCVData() {
        // Intentar obtener datos de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        
        let data;
        
        if (userId) {
            // Cargar datos específicos de usuario
            data = localStorage.getItem(`cv_data_${userId}`);
        } else {
            // Cargar datos del usuario actual o por defecto
            const loggedIn = localStorage.getItem('cv_logged_in');
            if (loggedIn) {
                const user = JSON.parse(loggedIn);
                data = localStorage.getItem(`cv_data_${user.id}`);
            }
            
            // Si no hay datos, usar datos por defecto
            if (!data) {
                data = localStorage.getItem('cv_default_data');
            }
        }

        this.cvData = data ? JSON.parse(data) : this.getDefaultData();
        this.renderCV();
        
        // Si hay parámetro print, imprimir
        if (urlParams.get('print')) {
            setTimeout(() => window.print(), 1000);
        }
    }

    getDefaultData() {
        return {
            personal: {
                fullName: 'TU NOMBRE AQUÍ',
                email: 'tu@email.com',
                phone: '+54 9 11 1234-5678',
                location: 'Ciudad, País',
                linkedin: 'linkedin.com/in/tuperfil'
            },
            capacitaciones: [
                'Community Manager certificado',
                'Reparación de PC',
                'Diseño gráfico Canva'
            ],
            perfil: 'Fato de perfil',
            habilidades: [
                'Gestión de redes sociales',
                'Creación de contenido',
                'Análisis de métricas'
            ],
            avatar: 'default'
        };
    }

    renderCV() {
        // Información personal
        document.getElementById('cvName').textContent = this.cvData.personal.fullName || 'TU NOMBRE AQUÍ';
        document.getElementById('cvTitle').textContent = 'Community Manager';
        
        // Avatar
        const avatarImg = document.getElementById('cvAvatar');
        if (this.cvData.customAvatar) {
            avatarImg.src = this.cvData.customAvatar;
        } else {
            avatarImg.src = `assets/avatars/${this.cvData.avatar || 'default'}.png`;
        }

        // Contacto
        document.getElementById('cvEmail').querySelector('span').textContent = this.cvData.personal.email || '';
        document.getElementById('cvPhone').querySelector('span').textContent = this.cvData.personal.phone || '';
        document.getElementById('cvLocation').querySelector('span').textContent = this.cvData.personal.location || '';
        document.getElementById('cvLinkedin').querySelector('span').textContent = this.cvData.personal.linkedin || '';

        // Perfil
        document.getElementById('perfilSection').querySelector('p').textContent = this.cvData.perfil || 'Fato de perfil';

        // Capacitaciones
        const capacitacionesList = document.getElementById('capacitacionesSection').querySelector('ul');
        capacitacionesList.innerHTML = this.cvData.capacitaciones
            .map(item => `<li>${item}</li>`)
            .join('');

        // Habilidades
        const habilidadesGrid = document.getElementById('habilidadesSection').querySelector('.skills-grid');
        habilidadesGrid.innerHTML = this.cvData.habilidades
            .map(item => `<div class="skill-item">${item}</div>`)
            .join('');

        // Mostrar/ocultar secciones según datos
        this.toggleSection('perfilSection', this.cvData.perfil && this.cvData.perfil !== 'Fato de perfil');
        this.toggleSection('capacitacionesSection', this.cvData.capacitaciones.length > 0);
        this.toggleSection('habilidadesSection', this.cvData.habilidades.length > 0);
    }

    toggleSection(sectionId, show) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = show ? 'block' : 'none';
        }
    }
}

// Para uso global
window.CVViewer = CVViewer;