// toaster.ts
interface ToasterOptions {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

export function showToast(options: ToasterOptions): void {
  const { message, type = "info", duration = 3000 } = options;

  let container = document.querySelector(".toaster-container") as HTMLElement;
  if (!container) {
    container = document.createElement("div");
    container.className = "toaster-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close">×</button>
    `;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  const timeout = setTimeout(() => removeToast(toast), duration);

  const closeButton = toast.querySelector(".toast-close") as HTMLButtonElement;
  closeButton?.addEventListener("click", () => {
    clearTimeout(timeout);
    removeToast(toast);
  });
}

function removeToast(toast: HTMLElement): void {
  toast.classList.remove("show");
  setTimeout(() => toast.remove(), 300);
}
