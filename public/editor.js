class Editor {
    constructor() {
        this.currentUser = null;
        this.cvData = this.loadCVData();
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDefaultData();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Navegación de autenticación
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuth('login'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showAuth('register'));
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuth('register');
        });
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuth('login');
        });

        // Formularios de autenticación
        document.getElementById('doLogin').addEventListener('click', () => this.login());
        document.getElementById('doRegister').addEventListener('click', () => this.register());

        // Navegación de tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectAvatar(e.currentTarget.dataset.avatar));
        });

        // Upload de avatar
        document.getElementById('avatarUpload').addEventListener('change', (e) => this.handleAvatarUpload(e));

        // Campos de nombre y título
        document.getElementById('userName').addEventListener('input', (e) => this.updateLivePreview());
        document.getElementById('userTitle').addEventListener('input', (e) => this.updateLivePreview());

        // Formularios de datos
        document.getElementById('savePersonal').addEventListener('click', () => this.savePersonalData());
        document.getElementById('saveCapacitaciones').addEventListener('click', () => this.saveCapacitaciones());
        document.getElementById('savePerfil').addEventListener('click', () => this.savePerfil());
        document.getElementById('saveHabilidades').addEventListener('click', () => this.saveHabilidades());

        // Listas dinámicas
        document.getElementById('addCapacitacion').addEventListener('click', () => this.addCapacitacion());
        document.getElementById('newCapacitacion').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCapacitacion();
        });

        document.getElementById('addHabilidad').addEventListener('click', () => this.addHabilidad());
        document.getElementById('newHabilidad').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabilidad();
        });

        // Acciones
        document.getElementById('generatePDF').addEventListener('click', () => this.generatePDF());
        document.getElementById('viewPublic').addEventListener('click', () => this.viewPublicCV());
        document.getElementById('printCV').addEventListener('click', () => this.printCV());

        // Cargar datos en formularios
        this.loadFormData();
    }

    showAuth(formType) {
        document.getElementById('loginForm').classList.toggle('hidden', formType !== 'login');
        document.getElementById('registerForm').classList.toggle('hidden', formType !== 'register');
    }

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        // Simulación de autenticación
        const users = JSON.parse(localStorage.getItem('cv_users') || '[]');
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

        if (user) {
            this.currentUser = user;
            this.cvData = this.loadCVData();
            this.showEditor();
            this.showNotification('¡Bienvenido de nuevo!', 'success');
        } else {
            this.showNotification('Usuario o contraseña incorrectos', 'error');
        }
    }

    register() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const username = document.getElementById('regUser').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;

        if (!name || !email || !username || !password) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        if (password !== confirm) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 8) {
            this.showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('cv_users') || '[]');
        
        if (users.find(u => u.username === username)) {
            this.showNotification('El nombre de usuario ya existe', 'error');
            return;
        }

        if (users.find(u => u.email === email)) {
            this.showNotification('El email ya está registrado', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            username,
            password, // En producción, esto debería estar encriptado
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('cv_users', JSON.stringify(users));

        // Crear datos iniciales del CV
        const initialCVData = {
            userId: newUser.id,
            personal: {
                fullName: name,
                email: email,
                phone: '',
                location: '',
                linkedin: ''
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

        localStorage.setItem(`cv_data_${newUser.id}`, JSON.stringify(initialCVData));

        this.currentUser = newUser;
        this.cvData = initialCVData;
        this.showEditor();
        this.showNotification('¡Cuenta creada exitosamente!', 'success');
    }

    showEditor() {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('editorSection').classList.remove('hidden');
        this.loadFormData();
        this.updateLivePreview();
    }

    checkAuthStatus() {
        const loggedInUser = localStorage.getItem('cv_logged_in');
        if (loggedInUser) {
            this.currentUser = JSON.parse(loggedInUser);
            this.cvData = this.loadCVData();
            this.showEditor();
        }
    }

    loadCVData() {
        if (!this.currentUser) return this.getDefaultData();
        
        const data = localStorage.getItem(`cv_data_${this.currentUser.id}`);
        return data ? JSON.parse(data) : this.getDefaultData();
    }

    getDefaultData() {
        return {
            personal: {
                fullName: '',
                email: '',
                phone: '',
                location: '',
                linkedin: ''
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

    loadFormData() {
        // Personal
        document.getElementById('fullName').value = this.cvData.personal.fullName || '';
        document.getElementById('email').value = this.cvData.personal.email || '';
        document.getElementById('phone').value = this.cvData.personal.phone || '';
        document.getElementById('location').value = this.cvData.personal.location || '';
        document.getElementById('linkedin').value = this.cvData.personal.linkedin || '';

        // Nombre y título
        document.getElementById('userName').value = this.cvData.personal.fullName || 'TU NOMBRE AQUÍ';
        document.getElementById('userTitle').value = 'Community Manager';

        // Perfil
        document.getElementById('perfilText').value = this.cvData.perfil || '';

        // Capacitaciones
        this.renderList('capacitacionesList', this.cvData.capacitaciones, 'capacitacion');

        // Habilidades
        this.renderList('habilidadesList', this.cvData.habilidades, 'habilidad');

        // Avatar
        this.selectAvatar(this.cvData.avatar || 'default', false);
    }

    renderList(containerId, items, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <span>${item}</span>
                <div class="item-actions">
                    <button onclick="editor.editListItem('${type}', ${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="editor.removeListItem('${type}', ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    savePersonalData() {
        this.cvData.personal = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            linkedin: document.getElementById('linkedin').value
        };

        // Actualizar también el nombre principal
        document.getElementById('userName').value = this.cvData.personal.fullName || 'TU NOMBRE AQUÍ';

        this.saveCVData();
        this.updateLivePreview();
        this.showNotification('Datos personales guardados', 'success');
    }

    saveCapacitaciones() {
        // Los datos ya están guardados en tiempo real
        this.showNotification('Capacitaciones guardadas', 'success');
    }

    savePerfil() {
        this.cvData.perfil = document.getElementById('perfilText').value;
        this.saveCVData();
        this.updateLivePreview();
        this.showNotification('Perfil guardado', 'success');
    }

    saveHabilidades() {
        // Los datos ya están guardados en tiempo real
        this.showNotification('Habilidades guardadas', 'success');
    }

    addCapacitacion() {
        const input = document.getElementById('newCapacitacion');
        const value = input.value.trim();
        
        if (value) {
            this.cvData.capacitaciones.push(value);
            this.renderList('capacitacionesList', this.cvData.capacitaciones, 'capacitacion');
            this.saveCVData();
            this.updateLivePreview();
            input.value = '';
            this.showNotification('Capacitación agregada', 'success');
        }
    }

    addHabilidad() {
        const input = document.getElementById('newHabilidad');
        const value = input.value.trim();
        
        if (value) {
            this.cvData.habilidades.push(value);
            this.renderList('habilidadesList', this.cvData.habilidades, 'habilidad');
            this.saveCVData();
            this.updateLivePreview();
            input.value = '';
            this.showNotification('Habilidad agregada', 'success');
        }
    }

    editListItem(type, index) {
        const list = type === 'capacitacion' ? this.cvData.capacitaciones : this.cvData.habilidades;
        const newValue = prompt('Editar item:', list[index]);
        
        if (newValue !== null) {
            list[index] = newValue.trim();
            this.saveCVData();
            this.loadFormData();
            this.updateLivePreview();
        }
    }

    removeListItem(type, index) {
        if (confirm('¿Eliminar este item?')) {
            if (type === 'capacitacion') {
                this.cvData.capacitaciones.splice(index, 1);
                this.renderList('capacitacionesList', this.cvData.capacitaciones, 'capacitacion');
            } else {
                this.cvData.habilidades.splice(index, 1);
                this.renderList('habilidadesList', this.cvData.habilidades, 'habilidad');
            }
            this.saveCVData();
            this.updateLivePreview();
        }
    }

    selectAvatar(avatarName, save = true) {
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.avatar === avatarName) {
                option.classList.add('selected');
            }
        });

        this.cvData.avatar = avatarName;
        
        if (save) {
            this.saveCVData();
            this.updateLivePreview();
        }
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Por favor selecciona una imagen', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // En una aplicación real, aquí subirías la imagen al servidor
            // Por ahora, guardamos como Data URL en localStorage
            this.cvData.customAvatar = e.target.result;
            this.saveCVData();
            
            // Actualizar vista previa
            const img = document.querySelector('.avatar-option.selected img');
            img.src = e.target.result;
            
            this.updateLivePreview();
            this.showNotification('Foto actualizada', 'success');
        };
        reader.readAsDataURL(file);
    }

    switchTab(tabName) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });

        // Si es la pestaña de vista previa, actualizar iframe
        if (tabName === 'preview') {
            setTimeout(() => {
                const iframe = document.getElementById('cvPreview');
                iframe.src = iframe.src; // Recargar
            }, 100);
        }
    }

    saveCVData() {
        if (this.currentUser) {
            localStorage.setItem(`cv_data_${this.currentUser.id}`, JSON.stringify(this.cvData));
            localStorage.setItem('cv_logged_in', JSON.stringify(this.currentUser));
        }
    }

    updateLivePreview() {
        const preview = document.getElementById('cvLivePreview');
        if (!preview) return;

        // Generar HTML para vista previa en tiempo real
        const html = `
            <div style="padding: 20px; font-family: 'Montserrat', sans-serif;">
                <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                        <img src="${this.cvData.customAvatar || `assets/avatars/${this.cvData.avatar}.png`}" 
                             alt="Avatar" 
                             style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid white;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem;">${document.getElementById('userName').value || 'TU NOMBRE AQUÍ'}</h2>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">${document.getElementById('userTitle').value || 'Community Manager'}</p>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.9rem;">
                        <div>${this.cvData.personal.email || 'Email no especificado'}</div>
                        <div>${this.cvData.personal.phone || 'Teléfono no especificado'}</div>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <h3 style="color: #6a11cb; border-bottom: 2px solid #6a11cb; padding-bottom: 5px;">PERFIL</h3>
                    <p>${this.cvData.perfil || 'Fato de perfil'}</p>
                </div>

                <div style="margin-bottom: 15px;">
                    <h3 style="color: #6a11cb; border-bottom: 2px solid #6a11cb; padding-bottom: 5px;">CAPACITACIONES</h3>
                    <ul style="padding-left: 20px;">
                        ${this.cvData.capacitaciones.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>

                <div>
                    <h3 style="color: #6a11cb; border-bottom: 2px solid #6a11cb; padding-bottom: 5px;">HABILIDADES</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${this.cvData.habilidades.map(item => 
                            `<span style="background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9rem;">${item}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        preview.innerHTML = html;
    }

    generatePDF() {
        this.showNotification('Generando PDF...', 'info');
        // En una implementación real, usarías una librería como jsPDF o html2pdf
        // Por ahora, abrimos la vista de impresión
        window.open('cv.html?print=true', '_blank');
    }

    viewPublicCV() {
        // Guardar datos actuales primero
        this.saveCVData();
        
        // Abrir en nueva pestaña
        window.open('cv.html', '_blank');
    }

    printCV() {
        window.open('cv.html?print=true', '_blank');
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar editor cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new Editor();
});

// Agregar estilos para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);