import { getSession } from "../../shared/user-session";
import { formatDate } from "../../shared/utils";
import { Card } from "../../shared/wirex-types";
import { showToast } from "../toaster";
import { toggleStatus, updateActiveBalance, updateCardLimit } from "./non-otp-actions";
import { executeWithOtp, getCardNumbers, getCvvCode } from "./otp-actions";

export function getCardSettingsHtml(): string {
  const hash = window.location.hash;
  const cardId = hash.split("/").pop();

  if (!cardId) {
    return `<div class="container"><h2>Card ID not found in URL</h2></div>`;
  }

  const session = getSession();
  let card: Card | null = null;
  if (session) {
    card = session.cards?.find((card) => card.id === cardId) ?? null;
  }
  if (!card) {
    return `<div class="container"><h2>Card not found</h2></div>`;
  }

  return `
 <div class="container">
        <h2>${card.card_data.format} ${card.card_data.payment_system} ${card.card_data.card_number_last_4}</h2>

        <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="read-only" id="card-id">${cardId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">User Email:</span>
            <span class="read-only" id="user-email"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="read-only" id="user-phone"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Limit:</span>
            <div class="limit-container">
                <span class="read-only" id="card-limit"></span>
                <input type="number" id="new-card-limit" placeholder="Enter new limit" />
                <button class="action-button" id="update-limit">Update Limit</button>
            </div>
        </div>
        <div class="detail-row">
            <span class="detail-label">Created At:</span>
            <span class="read-only" id="created-at"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Updated At:</span>
            <span class="read-only" id="updated-at"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Active Balance:</span>
            <div class="active-balance-container">
                <span class="read-only" id="active-balance"></span>
                <select id="new-active-balance">
                    ${card.balances
                      .map((balance) => {
                        const isActive = balance.is_active;
                        return `<option value="${balance.token_address}" ${isActive ? "selected" : ""}>${balance.token_symbol} ${balance.balance}</option>`;
                      })
                      .join("")}
                </select>
                <button class="action-button" id="update-balance">Update Balance</button>
            </div>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span><span id="action-text"></span><button class="action-button" id="status-button"></button></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Name on card:</span>
            <span class="read-only" id="user-name"></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Card No:</span>
            <div class="card-number-container">
                <span id="card-number-masked"></span>
                <span id="card-expiry" style="margin-left: 10px;"></span>
                 <button class="action-button" id="reveal-card-number">Reveal</button>
            </div>
        </div>
        <div class="detail-row">
            <span class="detail-label">CVV:</span>
            <div class="cvv-container">
                <span id="cvv-masked">xxx</span>
                <button class="action-button" id="reveal-cvv">Reveal</button>
            </div>
        </div>
    </div>
  `;
}

export function addCardSettingsEvents() {
  const hash = window.location.hash;
  const cardId = hash.split("/").pop();

  const session = getSession();
  let card: Card | null = null;
  if (session) {
    card = session.cards?.find((card) => card.id === cardId) ?? null;
  }
  if (!card) {
    return;
  }

  const cardIdElement = document.getElementById("card-id") as HTMLSpanElement;
  const userNameElement = document.getElementById("user-name") as HTMLSpanElement;
  const userEmailElement = document.getElementById("user-email") as HTMLSpanElement;
  const userPhoneElement = document.getElementById("user-phone") as HTMLSpanElement;
  const cardLimitElement = document.getElementById("card-limit") as HTMLSpanElement;
  const createdAtElement = document.getElementById("created-at") as HTMLSpanElement;
  const updatedAtElement = document.getElementById("updated-at") as HTMLSpanElement;
  const activeBalanceElement = document.getElementById("active-balance") as HTMLSpanElement;
  const statusButton = document.getElementById("status-button") as HTMLButtonElement;
  const statusText = document.getElementById("action-text") as HTMLSpanElement;
  const cardNumberMaskedElement = document.getElementById("card-number-masked") as HTMLSpanElement;
  const revealCardNumberButton = document.getElementById("reveal-card-number") as HTMLButtonElement;
  const cardExpiryElement = document.getElementById("card-expiry") as HTMLSpanElement;
  const cvvMaskedElement = document.getElementById("cvv-masked") as HTMLSpanElement;
  const revealCvvButton = document.getElementById("reveal-cvv") as HTMLButtonElement;
  const updateBalanceButton = document.getElementById("update-balance") as HTMLButtonElement;
  const newActiveBalanceElement = document.getElementById("new-active-balance") as HTMLSelectElement;
  const updateLimitButton = document.getElementById("update-limit") as HTMLButtonElement;
  const newCardLimitElement = document.getElementById("new-card-limit") as HTMLInputElement;

  updateLimitButton.addEventListener("click", () => {
    (async () => {
      const newLimit = parseInt(newCardLimitElement.value);
      if (isNaN(newLimit)) {
        showToast({ message: "Please enter a valid limit.", type: "error" });
        return;
      }

      if (!cardId) {
        showToast({ message: "Card ID is missing.", type: "error" });
        return;
      }

      const isSuccess = await updateCardLimit(cardId, newLimit);

      if (isSuccess) {
        card.limit.daily_limit = newLimit;
        cardLimitElement.textContent = `Daily: ${card.limit.daily_limit} / Used: ${card.limit.daily_usage ? card.limit.daily_usage : 0}`;
        showToast({ message: "Card limit updated successfully.", type: "success" });
      } else {
        showToast({ message: "Failed to update card limit.", type: "error" });
      }
    })().catch(console.error);
  });

  statusButton.addEventListener("click", () => {
    (async () => {
      const isSuccess = await toggleStatus(card);
      if (isSuccess) {
        card.status = card.status === "Blocked" ? "Active" : "Blocked";
        statusText.textContent = card.status;
        statusButton.textContent = card.status === "Blocked" ? "Unblock" : "Block";
        showToast({ message: `Card is ${card.status.toLowerCase()} now.`, type: "success" });
      } else {
        showToast({ message: "Failed to update card status.", type: "error" });
      }
    })().catch(console.error);
  });

  revealCardNumberButton.addEventListener("click", () => {
    executeWithOtp(getCardNumbers, cardNumberMaskedElement, card).catch((error) => console.error(error));
  });

  revealCvvButton.addEventListener("click", () => {
    executeWithOtp(getCvvCode, cvvMaskedElement, card).catch((error) => console.error(error));
  });

  updateBalanceButton.addEventListener("click", () => {
    (async () => {
      const selectedTokenAddress = newActiveBalanceElement.value;
      if (!cardId) {
        showToast({ message: "Card ID is missing.", type: "error" });
        return;
      }
      const isSuccess = await updateActiveBalance(cardId, selectedTokenAddress);

      if (isSuccess) {
        const activeBalance = card.balances.find((b) => b.token_address === selectedTokenAddress);
        activeBalanceElement.textContent = activeBalance ? `${activeBalance.balance} ${activeBalance.token_symbol}` : "N/A";
        showToast({ message: "Active balance updated successfully.", type: "success" });
      } else {
        showToast({ message: "Failed to update active balance.", type: "error" });
      }
    })().catch(console.error);
  });

  cardIdElement.textContent = card.id;
  userNameElement.textContent = card.card_data.name_on_card;
  if (session?.user.email) {
    userEmailElement.textContent = session.user.email;
  }

  if (session?.user.phone_number_data.phone_number) {
    userPhoneElement.textContent = `${session?.user.phone_number_data.phone_number} (${session?.user.phone_number_data?.is_confirmed ? "Confirmed" : "Not Confirmed"})`;
  }

  cardLimitElement.textContent = `Daily: ${card.limit.daily_limit ? card.limit.daily_limit : 0} / Used: ${card.limit.daily_usage ? card.limit.daily_usage : 0}`;
  createdAtElement.textContent = formatDate(card.created_at);
  updatedAtElement.textContent = card.updated_at ? formatDate(card.updated_at) : "N/A";
  const activeBalance = card.balances.find((b) => b.is_active);
  activeBalanceElement.textContent = activeBalance ? `${activeBalance.balance} ${activeBalance.token_symbol}` : "N/A";
  statusText.textContent = card.status;
  statusButton.textContent = card.status === "Blocked" ? "Unblock" : "Block";
  cardNumberMaskedElement.textContent = `xxxx xxxx xxxx ${card.card_data.card_number_last_4 ?? "****"}`;
  cardExpiryElement.textContent = `Expiry: ${card.card_data.expiry_date ?? "xx/xx"}`;
}
