const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para ver CV público
app.get('/cv', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cv.html'));
});

// API para guardar datos del CV
app.post('/api/save-cv', (req, res) => {
    try {
        const { userId, cvData } = req.body;
        
        // En producción, aquí guardarías en una base de datos
        // Por ahora, simulamos guardado exitoso
        
        res.json({
            success: true,
            message: 'CV guardado exitosamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al guardar el CV',
            error: error.message
        });
    }
});

// API para cargar datos del CV
app.get('/api/load-cv/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        
        // En producción, cargarías de una base de datos
        // Por ahora, devolvemos datos de ejemplo
        
        const sampleData = {
            userId,
            personal: {
                fullName: 'Nocly Viviana Acuña',
                email: 'nocly@ejemplo.com',
                phone: '+54 9 11 1234-5678',
                location: 'Buenos Aires, Argentina',
                linkedin: 'linkedin.com/in/noclyacuña'
            },
            capacitaciones: [
                'Community Manager certificado',
                'Reparación de PC',
                'Diseño gráfico Canva'
            ],
            perfil: 'Community Manager con experiencia en gestión de redes sociales y creación de contenido digital.',
            habilidades: [
                'Gestión de redes sociales',
                'Creación de contenido',
                'Análisis de métricas',
                'Diseño gráfico',
                'SEO básico'
            ],
            avatar: 'avatar1'
        };
        
        res.json({
            success: true,
            data: sampleData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cargar el CV',
            error: error.message
        });
    }
});

// Servir archivos estáticos
app.get('/assets/avatars/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', 'assets', 'avatars', filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // Si no existe, servir el avatar por defecto
        res.sendFile(path.join(__dirname, 'public', 'assets', 'avatars', 'default.png'));
    }
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Editor disponible en http://localhost:${PORT}`);
    console.log(`Vista pública disponible en http://localhost:${PORT}/cv`);
});