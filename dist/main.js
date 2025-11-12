/**
 * Shipping Form SDK
 * Version: 1.0.0
 * Easy integration for collecting shipping information
 */

(function(window) {
  'use strict';

  const IFRAME_URL = 'https://your-domain.com/shipping-form.html'; // Replace with your actual URL
  
  class ShippingFormSDK {
    constructor(config = {}) {
      this.config = {
        apiEndpoint: config.apiEndpoint || 'https://your-rails-app.com/api/shipping-info',
        apiKey: config.apiKey || '',
        theme: config.theme || 'light',
        onSuccess: config.onSuccess || null,
        onError: config.onError || null,
        onClose: config.onClose || null,
        customStyles: config.customStyles || {}
      };
      
      this.iframe = null;
      this.overlay = null;
      this.isOpen = false;
      
      this._setupMessageListener();
    }

    /**
     * Initialize and open the modal
     */
    open() {
      if (this.isOpen) return;
      
      this._createOverlay();
      this._createIframe();
      this.isOpen = true;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    /**
     * Close the modal
     */
    close() {
      if (!this.isOpen) return;
      
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      
      this.iframe = null;
      this.overlay = null;
      this.isOpen = false;
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      if (this.config.onClose) {
        this.config.onClose();
      }
    }

    /**
     * Create overlay backdrop
     */
    _createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.id = 'shipping-form-overlay';
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999998;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
      `;
      
      // Close on overlay click
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
      
      document.body.appendChild(this.overlay);
    }

    /**
     * Create iframe
     */
    _createIframe() {
      const container = document.createElement('div');
      container.style.cssText = `
        position: relative;
        width: 95%;
        max-width: 1200px;
        height: 90vh;
        max-height: 900px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      `;
      
      this.iframe = document.createElement('iframe');
      this.iframe.id = 'shipping-form-iframe';
      this.iframe.src = `${IFRAME_URL}?config=${encodeURIComponent(JSON.stringify(this.config))}`;
      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        display: block;
      `;
      
      // Security attributes
      this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
      this.iframe.setAttribute('loading', 'eager');
      
      container.appendChild(this.iframe);
      this.overlay.appendChild(container);
    }

    /**
     * Setup message listener for iframe communication
     */
    _setupMessageListener() {
      window.addEventListener('message', (event) => {
        // Verify origin for security (update with your actual domain)
        // if (event.origin !== 'https://your-domain.com') return;
        
        const { type, data } = event.data;
        
        switch(type) {
          case 'SHIPPING_FORM_CLOSE':
            this.close();
            break;
            
          case 'SHIPPING_FORM_SUBMIT':
            this._handleSubmit(data);
            break;
            
          case 'SHIPPING_FORM_ERROR':
            if (this.config.onError) {
              this.config.onError(data);
            }
            break;
        }
      });
    }

    /**
     * Handle form submission
     */
    async _handleSubmit(formData) {
      try {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Submission failed');
        }

        // Notify iframe of success
        if (this.iframe && this.iframe.contentWindow) {
          this.iframe.contentWindow.postMessage({
            type: 'SUBMISSION_SUCCESS',
            data: result
          }, '*');
        }

        // Call success callback
        if (this.config.onSuccess) {
          this.config.onSuccess(result);
        }

        // Auto-close after 2 seconds
        setTimeout(() => {
          this.close();
        }, 2000);

      } catch (error) {
        // Notify iframe of error
        if (this.iframe && this.iframe.contentWindow) {
          this.iframe.contentWindow.postMessage({
            type: 'SUBMISSION_ERROR',
            data: { message: error.message }
          }, '*');
        }

        if (this.config.onError) {
          this.config.onError(error);
        }
      }
    }
  }

  // Expose to global scope
  window.ShippingFormSDK = ShippingFormSDK;

  // Also create a simple global instance method
  window.initShippingForm = function(config) {
    return new ShippingFormSDK(config);
  };

})(window);