class PDFGenerator {
    constructor() {
        this.pdfDoc = null;
        this.pageWidth = 210; // mm (A4)
        this.pageHeight = 297; // mm (A4)
        this.margin = 20; // mm
    }

    async generateFromCV() {
        this.showLoading(true);
        
        try {
            // Cargar html2pdf si no está disponible
            if (typeof html2pdf === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
            }
            
            const cvContainer = document.getElementById('cvContainer');
            
            if (!cvContainer) {
                throw new Error('No se encontró el contenido del CV');
            }

            // Configuración de html2pdf
            const opt = {
                margin: [10, 10, 10, 10],
                filename: 'CV_Community_Manager.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy'] 
                }
            };

            // Clonar el elemento para no afectar la vista actual
            const element = cvContainer.cloneNode(true);
            element.style.width = '210mm';
            element.style.maxWidth = '210mm';
            
            // Ocultar el botón de impresión en el PDF
            const printBtn = element.querySelector('.print-btn');
            if (printBtn) printBtn.style.display = 'none';
            
            // Aplicar estilos de impresión
            element.classList.add('pdf-export');
            
            // Generar PDF
            await html2pdf().set(opt).from(element).save();
            
            this.showLoading(false);
            this.showNotification('PDF generado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            this.showLoading(false);
            this.showNotification('Error al generar PDF: ' + error.message, 'error');
            
            // Fallback: Abrir ventana de impresión
            window.print();
        }
    }

    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    showLoading(show) {
        let loading = document.getElementById('pdfLoading');
        
        if (show) {
            if (!loading) {
                loading = document.createElement('div');
                loading.id = 'pdfLoading';
                loading.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        color: white;
                    ">
                        <div class="spinner" style="
                            width: 50px;
                            height: 50px;
                            border: 5px solid rgba(255,255,255,0.3);
                            border-radius: 50%;
                            border-top-color: white;
                            animation: spin 1s linear infinite;
                            margin-bottom: 20px;
                        "></div>
                        <h3>Generando PDF...</h3>
                        <p>Por favor espera un momento</p>
                    </div>
                `;
                document.body.appendChild(loading);
                
                // Agregar animación
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            loading.style.display = 'flex';
        } else if (loading) {
            loading.style.display = 'none';
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Método alternativo usando jsPDF (más control pero más complejo)
    generateWithJsPDF() {
        // Esta es una implementación básica
        // En producción, necesitarías una implementación más completa
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Configuración básica
        doc.setFont('helvetica');
        doc.setFontSize(20);
        doc.setTextColor(106, 17, 203); // Color morado
        
        // Título
        doc.text('CV - Community Manager', 105, 20, { align: 'center' });
        
        // Línea divisoria
        doc.setDrawColor(106, 17, 203);
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Este es un PDF básico. Para una versión completa, usa el botón "Generar PDF" en el editor.', 20, 40);
        
        doc.save('CV_Community_Manager.pdf');
    }
}

// Para uso global
window.PDFGenerator = PDFGenerator;

// Integración con el editor
document.addEventListener('DOMContentLoaded', function() {
    // Si hay un botón de generar PDF en esta página
    const generateBtn = document.getElementById('generatePDF');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const pdfGen = new PDFGenerator();
            pdfGen.generateFromCV();
        });
    }
});