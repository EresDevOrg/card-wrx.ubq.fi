export interface PopupOptions {
  title?: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  shouldShowCancelButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (input?: string) => Promise<void>;
  onCancel?: () => void;
  isPrompt?: boolean;
  inputPlaceholder?: string;
  defaultValue?: string;
}

export function showPopup(options: PopupOptions): Promise<string | boolean | undefined> {
  return new Promise((resolve) => {
    const {
      title,
      message,
      type = "info",
      shouldShowCancelButton = false,
      confirmText = "OK",
      cancelText = "Cancel",
      onConfirm,
      onCancel,
      isPrompt = false,
      inputPlaceholder = "",
      defaultValue = "",
    } = options;

    // Create backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "popup-backdrop";

    // Create container
    const container = document.createElement("div");
    container.className = `popup-container popup-${type}`;

    // Title (optional)
    if (title) {
      const titleElement = document.createElement("h2");
      titleElement.className = "popup-title";
      titleElement.textContent = title;
      container.appendChild(titleElement);
    }

    // Message
    const messageElement = document.createElement("div");
    messageElement.className = "popup-message";
    messageElement.textContent = message;
    container.appendChild(messageElement);

    // Input for prompt
    let inputElement: HTMLInputElement | undefined;
    if (isPrompt) {
      inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.className = "popup-input";
      inputElement.placeholder = inputPlaceholder;
      inputElement.value = defaultValue;
      container.appendChild(inputElement);
    }

    // Buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "popup-buttons";

    // Cancel button (optional)
    if (shouldShowCancelButton) {
      const cancelButton = document.createElement("button");
      cancelButton.className = "popup-button popup-button-cancel";
      cancelButton.textContent = cancelText;
      cancelButton.addEventListener("click", () => {
        removePopup(backdrop);
        onCancel?.();
        resolve(false);
      });
      buttonsContainer.appendChild(cancelButton);
    }

    // Confirm button
    const confirmButton = document.createElement("button");
    confirmButton.className = "popup-button popup-button-confirm";
    confirmButton.textContent = confirmText;
    confirmButton.addEventListener("click", () => {
      removePopup(backdrop);
      if (isPrompt && inputElement) {
        onConfirm?.(inputElement.value).catch(console.error);
        resolve(inputElement.value);
      } else {
        onConfirm?.().catch(console.error);
        resolve(true);
      }
    });
    buttonsContainer.appendChild(confirmButton);

    container.appendChild(buttonsContainer);
    document.body.appendChild(backdrop);
    backdrop.appendChild(container);

    // Animation
    setTimeout(() => {
      backdrop.classList.add("show");
      container.classList.add("show");
    }, 10);

    // Close on backdrop click (optional, you might want to disable for prompts)
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop && !isPrompt) {
        removePopup(backdrop);
        onCancel?.();
        resolve(undefined);
      }
    });

    // Close on Escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        removePopup(backdrop);
        onCancel?.();
        resolve(undefined);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  });
}

function removePopup(backdrop: HTMLElement): void {
  const container = backdrop.querySelector(".popup-container");
  if (container) {
    container.classList.remove("show");
  }
  backdrop.classList.remove("show");
  setTimeout(() => {
    if (backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
  }, 300); // Same duration as the fade-out transition
}
