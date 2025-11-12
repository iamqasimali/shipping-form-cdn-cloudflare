/**
 * Shipping Form SDK
 * Version: 2.0.0
 * Complete shipping information collection with robust error handling
 */

(function (window) {
  "use strict";

  const IFRAME_URL =
    "https://shipping-form-cdn.iamqasimalizahid.workers.dev/index.html";
  const SDK_VERSION = "2.0.0";

  class ShippingFormSDK {
    constructor(config = {}) {
      // Validate required configuration
      if (!config.apiEndpoint) {
        throw new Error("apiEndpoint is required in configuration");
      }

      if (!config.apiKey) {
        console.warn("⚠️ apiKey is recommended for secure API communication");
      }

      this.config = {
        apiEndpoint: config.apiEndpoint,
        apiKey: config.apiKey || "",
        theme: config.theme || "light",
        language: config.language || "en",
        autoClose: config.autoClose !== false, // Default true
        customStyles: config.customStyles || {},
        onSuccess: config.onSuccess || null,
        onError: config.onError || null,
        onClose: config.onClose || null,
        onLoad: config.onLoad || null,
        onSubmit: config.onSubmit || null,
      };

      this.iframe = null;
      this.overlay = null;
      this.isOpen = false;
      this.isLoading = false;

      this._setupMessageListener();
      this._setupGlobalCloseHandler();
    }

    /**
     * Initialize and open the modal
     */
    open() {
      if (this.isOpen) {
        console.warn("Shipping form is already open");
        return;
      }

      this._createOverlay();
      this._createIframe();
      this.isOpen = true;
      this.isLoading = true;

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      console.log("🚀 Shipping Form SDK opened");
    }

    /**
     * Close the modal
     */
    close() {
      if (!this.isOpen) return;

      // Clean up DOM elements
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }

      this.iframe = null;
      this.overlay = null;
      this.isOpen = false;
      this.isLoading = false;

      // Restore body scroll
      document.body.style.overflow = "";

      // Call close callback
      if (this.config.onClose) {
        this.config.onClose();
      }

      console.log("📦 Shipping Form SDK closed");
    }

    /**
     * Update configuration dynamically
     */
    updateConfig(newConfig) {
      Object.assign(this.config, newConfig);
      console.log("⚙️ SDK configuration updated");
    }

    /**
     * Create overlay backdrop
     */
    _createOverlay() {
      this.overlay = document.createElement("div");
      this.overlay.id = "shipping-form-overlay";
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999998;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(8px);
        animation: overlayFadeIn 0.3s ease;
      `;

      // Add CSS animation
      this._injectCSS(`
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `);

      // Close on overlay click
      this.overlay.addEventListener("click", (e) => {
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
      const container = document.createElement("div");
      container.id = "shipping-form-container";
      container.style.cssText = `
        position: relative;
        width: 95%;
        max-width: 800px;
        height: 85vh;
        max-height: 700px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        animation: modalSlideIn 0.3s ease;
      `;

      // Add loading spinner
      const loadingSpinner = document.createElement("div");
      loadingSpinner.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #666;
          z-index: 1;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          Loading Shipping Form...
        </div>
      `;
      container.appendChild(loadingSpinner);

      this.iframe = document.createElement("iframe");
      this.iframe.id = "shipping-form-iframe";

      // Build URL with configuration
      const urlParams = new URLSearchParams({
        config: JSON.stringify(this.config),
        sdk_version: SDK_VERSION,
        timestamp: Date.now(),
      });

      this.iframe.src = `${IFRAME_URL}?${urlParams}`;
      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        display: block;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      // Security attributes
      this.iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms allow-popups"
      );
      this.iframe.setAttribute("loading", "eager");
      this.iframe.setAttribute("title", "Shipping Information Form");

      // Handle iframe load
      this.iframe.addEventListener("load", () => {
        this.isLoading = false;
        this.iframe.style.opacity = "1";
        loadingSpinner.style.display = "none";

        if (this.config.onLoad) {
          this.config.onLoad();
        }

        console.log("✅ Shipping form loaded successfully");
      });

      this.iframe.addEventListener("error", () => {
        this.isLoading = false;
        loadingSpinner.innerHTML = `
          <div style="color: #ef4444; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            Failed to load shipping form<br>
            <button onclick="window.location.reload()" style="
              margin-top: 16px;
              padding: 8px 16px;
              background: #6366f1;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">Retry</button>
          </div>
        `;

        if (this.config.onError) {
          this.config.onError(new Error("Failed to load shipping form"));
        }
      });

      container.appendChild(this.iframe);
      this.overlay.appendChild(container);
    }

    /**
     * Setup message listener for iframe communication
     */
    _setupMessageListener() {
      this.messageHandler = (event) => {
        // Add origin validation in production
        // if (event.origin !== 'https://your-trusted-domain.com') return;

        const { type, data } = event.data || {};

        switch (type) {
          case "SHIPPING_FORM_READY":
            console.log("📦 Shipping form is ready");
            break;

          case "SHIPPING_FORM_CLOSE":
            this.close();
            break;

          case "SHIPPING_FORM_SUBMIT":
            this._handleSubmit(data);
            break;

          case "SHIPPING_FORM_VALIDATION_ERROR":
            if (this.config.onError) {
              this.config.onError(
                new Error(
                  "Validation failed: " +
                    (data.message || "Please check your inputs")
                )
              );
            }
            break;

          case "SHIPPING_FORM_ERROR":
            if (this.config.onError) {
              this.config.onError(
                new Error(data.message || "Form error occurred")
              );
            }
            break;
        }
      };

      window.addEventListener("message", this.messageHandler);
    }

    /**
     * Setup global escape key handler
     */
    _setupGlobalCloseHandler() {
      this.escapeHandler = (event) => {
        if (event.key === "Escape" && this.isOpen) {
          this.close();
        }
      };

      window.addEventListener("keydown", this.escapeHandler);
    }

    /**
     * Handle form submission to your API
     */
    async _handleSubmit(formData) {
      try {
        console.log("📤 Submitting shipping data:", formData);

        // Call onSubmit callback if provided
        if (this.config.onSubmit) {
          this.config.onSubmit(formData);
        }

        const response = await fetch(this.config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.config.apiKey,
            Accept: "application/json",
            "X-SDK-Version": SDK_VERSION,
          },
          body: JSON.stringify({
            ...formData,
            metadata: {
              sdk_version: SDK_VERSION,
              submitted_at: new Date().toISOString(),
              user_agent: navigator.userAgent,
            },
          }),
        });

        const result = await response.json();
        console.log("📥 API Response:", {
          status: response.status,
          data: result,
        });

        if (!response.ok) {
          // Handle API error response
          throw new Error(
            result.error?.message ||
              result.message ||
              `Submission failed with status ${response.status}`
          );
        }

        // Validate success response structure
        if (!result.success && result.success !== undefined) {
          throw new Error("Invalid API response format: missing success flag");
        }

        // Notify iframe of success
        this._sendToIframe("SUBMISSION_SUCCESS", {
          tracking_number: result.data?.tracking_number,
          shipment_id: result.data?.id,
          estimated_delivery: result.data?.estimated_delivery,
          message: result.message,
        });

        // Call success callback
        if (this.config.onSuccess) {
          this.config.onSuccess(result.data || result);
        }

        // Auto-close after success (if enabled)
        if (this.config.autoClose) {
          setTimeout(() => {
            this.close();
          }, 2000);
        }
      } catch (error) {
        console.error("❌ Submission error:", error);

        // Notify iframe of error
        this._sendToIframe("SUBMISSION_ERROR", {
          message: error.message,
          code: error.code || "SUBMISSION_FAILED",
        });

        // Call error callback
        if (this.config.onError) {
          this.config.onError(error);
        }
      }
    }

    /**
     * Send message to iframe
     */
    _sendToIframe(type, data) {
      if (this.iframe && this.iframe.contentWindow) {
        this.iframe.contentWindow.postMessage(
          {
            type,
            data,
          },
          "*"
        );
      }
    }

    /**
     * Inject CSS styles
     */
    _injectCSS(css) {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    }

    /**
     * Clean up event listeners
     */
    destroy() {
      window.removeEventListener("message", this.messageHandler);
      window.removeEventListener("keydown", this.escapeHandler);
      this.close();
      console.log("🧹 Shipping Form SDK destroyed");
    }
  }

  // Expose to global scope
  window.ShippingFormSDK = ShippingFormSDK;

  // Global initialization helper
  window.initShippingForm = function (config) {
    return new ShippingFormSDK(config);
  };

  // Auto-initialize if data attributes are present
  document.addEventListener("DOMContentLoaded", function () {
    const autoInitElement = document.querySelector("[data-shipping-form]");
    if (autoInitElement) {
      const config = {
        apiEndpoint: autoInitElement.dataset.apiEndpoint,
        apiKey: autoInitElement.dataset.apiKey,
        theme: autoInitElement.dataset.theme || "light",
      };

      if (config.apiEndpoint) {
        window.shippingForm = new ShippingFormSDK(config);
        autoInitElement.addEventListener("click", () => {
          window.shippingForm.open();
        });
      }
    }
  });
})(window);
