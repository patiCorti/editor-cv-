// subscription.js - Archivo COMPLETO
class SubscriptionManager {
  constructor() {
    this.USER_PRICE = 1000; // ARS
    this.TRIAL_DAYS = 14;
    this.MAX_FREE_EDITS = 3;
  }

  async init() {
    // Contar ediciones
    this.setupEditCounter();
    
    // Verificar estado de suscripción
    const userStatus = await this.checkUserStatus();
    
    if (!userStatus.active) {
      // Si no tiene suscripción, verificar si superó las ediciones gratis
      const editCount = parseInt(localStorage.getItem('editCount') || '0');
      if (editCount >= this.MAX_FREE_EDITS) {
        this.showPricingModal();
      }
    }
  }

  setupEditCounter() {
    // Incrementar contador cuando se guarda información
    const originalGuardarInfo = window.guardarInfoPersonal;
    window.guardarInfoPersonal = function() {
      const editCount = parseInt(localStorage.getItem('editCount') || '0');
      localStorage.setItem('editCount', editCount + 1);
      
      // Llamar a la función original
      if (originalGuardarInfo) {
        return originalGuardarInfo.apply(this, arguments);
      }
    };

    // También contar cuando se agregan items
    const originalAgregarItem = window.agregarItem;
    window.agregarItem = function(seccion) {
      const editCount = parseInt(localStorage.getItem('editCount') || '0');
      localStorage.setItem('editCount', editCount + 1);
      
      if (originalAgregarItem) {
        return originalAgregarItem.apply(this, arguments);
      }
    };
  }

  async checkUserStatus() {
    const userId = localStorage.getItem('userId') || 'demo-user';
    
    // Para MVP, usar localStorage
    const subscription = localStorage.getItem('subscription');
    
    if (!subscription) {
      return { 
        active: false, 
        trial: true,
        remainingEdits: this.MAX_FREE_EDITS - (parseInt(localStorage.getItem('editCount') || '0'))
      };
    }
    
    const data = JSON.parse(subscription);
    const now = new Date();
    const expDate = new Date(data.expirationDate);
    
    return {
      active: now < expDate,
      trial: data.isTrial,
      expirationDate: data.expirationDate,
      userId: data.userId
    };
  }

  showPricingModal() {
    document.getElementById('pricingModal').classList.add('active');
    this.lockEditor();
  }

  lockEditor() {
    // Bloquear funciones premium
    const premiumFeatures = document.querySelectorAll('.premium-feature');
    if (premiumFeatures.length > 0) {
      premiumFeatures.forEach(el => {
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
      });
    }
    
    // Mostrar mensaje de bloqueo
    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer && !document.querySelector('.lock-message')) {
      const lockMessage = document.createElement('div');
      lockMessage.className = 'lock-message';
      lockMessage.innerHTML = `
        <div style="text-align: center; padding: 15px;">
          <h3 style="color: #e74c3c; margin-bottom: 10px;">
            <i class="fas fa-lock"></i> Límite de prueba alcanzado
          </h3>
          <p>¡Has usado todas las ediciones de prueba!</p>
          <p>Desbloquea todas las funciones por solo <strong style="color: #2c3e50;">$1,000/año</strong></p>
          <button onclick="document.getElementById('pricingModal').classList.add('active')" 
                  style="background: #2c3e50; color: white; border: none; padding: 12px 30px; 
                         border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 15px;">
            <i class="fas fa-unlock"></i> Desbloquear Ahora
          </button>
        </div>
      `;
      
      editorContainer.prepend(lockMessage);
    }
  }

  async pagarConMercadoPago() {
    // Datos para MercadoPago
    const preferenceData = {
      items: [{
        title: "CV Web Anual - CV Millón",
        description: "Subdominio personalizado + Editor completo + PDF profesional",
        quantity: 1,
        currency_id: "ARS",
        unit_price: this.USER_PRICE
      }],
      payer: {
        name: localStorage.getItem('userName') || "Usuario CV Millón",
        email: localStorage.getItem('userEmail') || "usuario@cvmillon.com"
      },
      back_urls: {
        success: window.location.origin + "/pago-exitoso.html",
        failure: window.location.origin + "/pago-fallido.html",
        pending: window.location.origin + "/pago-pendiente.html"
      },
      auto_return: "approved",
      notification_url: "https://tuservidor.com/api/mercadopago/notifications"
    };

    try {
      // En producción, esto llamaría a tu backend
      // const response = await fetch('/api/create-preference', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferenceData)
      // });
      
      // const data = await response.json();
      // window.location.href = data.init_point;
      
      // Por ahora, simulamos el pago exitoso
      console.log('Simulando pago con MercadoPago:', preferenceData);
      this.mostrarDatosTransferencia(); // Mostrar opción alternativa
      
    } catch (error) {
      console.error('Error MercadoPago:', error);
      this.mostrarDatosTransferencia();
    }
  }

  mostrarDatosTransferencia() {
    const modal = document.createElement('div');
    modal.className = 'transfer-modal active';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: white;
        padding: 40px;
        border-radius: 20px;
        max-width: 500px;
        width: 90%;
        text-align: center;
      ">
        <h3 style="color: #2c3e50; margin-bottom: 25px;">
          <i class="fas fa-university"></i> Transferencia Bancaria
        </h3>
        <div class="bank-data" style="
          background: #f8f9fa;
          padding: 25px;
          border-radius: 15px;
          text-align: left;
          margin: 25px 0;
          border-left: 5px solid #7cc39b;
        ">
          <p><strong>Banco:</strong> Galicia</p>
          <p><strong>Titular:</strong> CV Millón S.A.</p>
          <p><strong>CBU:</strong> 0070000000000000000000</p>
          <p><strong>Alias:</strong> CV.MILLON.WEB</p>
          <p><strong>Importe:</strong> $1,000 ARS</p>
        </div>
        <p class="instruction" style="
          background: #fff3cd;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #ffeaa7;
          margin: 25px 0;
          font-size: 1.1rem;
        ">
          <strong>Instrucciones:</strong><br>
          1. Realiza la transferencia por $1,000 ARS<br>
          2. Toma captura del comprobante<br>
          3. Envíalo a nuestro WhatsApp:<br>
          <strong style="color: #25D366; font-size: 1.2rem;">+54 11 1234-5678</strong>
        </p>
        <button onclick="this.closest('.transfer-modal').remove(); subscriptionManager.activarSuscripcion('demo-user', 'transferencia')" 
                style="
                  background: #2c3e50;
                  color: white;
                  border: none;
                  padding: 15px 40px;
                  border-radius: 10px;
                  font-size: 1.2rem;
                  font-weight: bold;
                  cursor: pointer;
                  margin-top: 15px;
                ">
          <i class="fas fa-check-circle"></i> Ya realicé el pago
        </button>
        <br>
        <button onclick="this.closest('.transfer-modal').remove()" 
                style="
                  background: transparent;
                  color: #666;
                  border: 2px solid #ddd;
                  padding: 10px 30px;
                  border-radius: 8px;
                  margin-top: 15px;
                  cursor: pointer;
                ">
          Cancelar
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  activarSuscripcion(userId, metodoPago) {
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    const subscriptionData = {
      userId: userId || 'demo-user',
      active: true,
      expirationDate: expirationDate.toISOString(),
      paymentMethod: metodoPago,
      price: this.USER_PRICE,
      activatedDate: new Date().toISOString()
    };
    
    localStorage.setItem('subscription', JSON.stringify(subscriptionData));
    
    // Desbloquear editor
    document.getElementById('pricingModal').classList.remove('active');
    const lockMessage = document.querySelector('.lock-message');
    if (lockMessage) {
      lockMessage.remove();
    }
    
    // Restaurar funciones premium
    document.querySelectorAll('.premium-feature').forEach(el => {
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });
    
    // Mostrar confirmación
    this.mostrarConfirmacion();
    
    // Resetear contador de ediciones
    localStorage.setItem('editCount', '0');
  }

  mostrarConfirmacion() {
    const notif = document.createElement('div');
    notif.className = 'success-notification';
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2ecc71;
      color: white;
      padding: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
      z-index: 99999;
      animation: slideInRight 0.3s ease;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    `;
    
    notif.innerHTML = `
      <i class="fas fa-party-horn" style="font-size: 2rem;"></i>
      <div>
        <strong style="font-size: 1.2rem;">¡Felicitaciones!</strong>
        <p>Tu CV web está activo por 1 año completo</p>
      </div>
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0 10px;
      ">×</button>
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
      if (notif.parentElement) {
        notif.remove();
      }
    }, 5000);
  }
}

// Hacer funciones disponibles globalmente
window.pagarConMercadoPago = function() {
  subscriptionManager.pagarConMercadoPago();
};

window.mostrarDatosTransferencia = function() {
  subscriptionManager.mostrarDatosTransferencia();
};

// Inicializar
const subscriptionManager = new SubscriptionManager();
document.addEventListener('DOMContentLoaded', () => subscriptionManager.init());