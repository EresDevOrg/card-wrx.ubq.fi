import { getUserAuthToken2 } from "../shared/user-auth";
import { getWirexApiUrl } from "../shared/utils";
import { Card } from "../shared/wirex-types";
import { showToast } from "./toaster";

export function getCardSettingsHtml(cardId: string): string {
  const auth = getUserAuthToken2();
  let card: Card | null = null;
  if (auth) {
    card = auth.cards?.find((card) => card.id === cardId) ?? null;
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
            <span class="detail-label">Limit:</span>
            <span class="read-only" id="card-limit"></span>
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
            <span class="read-only" id="active-balance"></span>
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
                <button class="action-button" id="reveal-card-number">Reveal</button>
                <span id="card-expiry" style="margin-left: 10px;"></span>
            </div>
        </div>
        <div class="detail-row">
            <span class="detail-label">CVV:</span>
            <div class="cvv-container">
                <span id="cvv-masked">xxx</span>
                <button class="action-button" id="reveal-cvv">Reveal</button>
                <span id="cvv-actual" style="display: none;"></span>
            </div>
        </div>
        <div class="detail-row">
            <span class="detail-label">Spending Limit:</span>
            <div>
                <input type="number" class="editable-field" id="spending-limit-input">
                <button class="action-button" id="save-spending-limit">Save</button>
            </div>
        </div>

        <h3>Transaction History</h3>
        <table class="transactions-table">
            <thead>
                <tr>
                    <th>ID</th>￼
CAKE

    </div>

  `;
}

export function addCardSettingsEvents(cardId: string) {
  const auth = getUserAuthToken2();
  let card: Card | null = null;
  if (auth) {
    card = auth.cards?.find((card) => card.id === cardId) ?? null;
  }
  if (!card) {
    return;
  }
  interface MissingCardDetails {
    cardNumber?: string;
    cvv?: string;
    spendingLimit?: number;
    id?: string;
  }

  // Example Missing Card Details
  const missingCardDetails: MissingCardDetails = {
    cardNumber: "4111111111111234",
    cvv: "123",
    spendingLimit: 300,
    id: "card123",
  };

  interface Transaction {
    id: string;
    date: Date;
    description: string;
    amount: string;
    status: "Pending" | "Completed" | "Failed";
  }

  const transactions: Transaction[] = [];
  const numberOfTransactions = 20;
  const transactionDescriptions = ["Online Purchase", "Restaurant Bill", "ATM Withdrawal", "Transfer Received", "Subscription Payment"];
  const transactionStatuses: ("Pending" | "Completed" | "Failed")[] = ["Pending", "Completed", "Failed"];

  for (let i = 0; i < numberOfTransactions; i++) {
    const amount = (0.54545 * 100).toFixed(2);
    const typeIndex = Math.floor(0.545222 * transactionDescriptions.length);
    const statusIndex = Math.floor(0.12334 * transactionStatuses.length);
    transactions.push({
      id: `txn${i + 1}`,
      date: new Date(Date.now() - 0.21459 * 30 * 24 * 60 * 60 * 1000), // Last 30 days
      description: transactionDescriptions[typeIndex],
      amount: (i % 2 === 0 ? "-" : "+") + amount + " USDT",
      status: transactionStatuses[statusIndex],
    });
  }

  const cardIdElement = document.getElementById("card-id") as HTMLSpanElement;
  const userNameElement = document.getElementById("user-name") as HTMLSpanElement;
  const userEmailElement = document.getElementById("user-email") as HTMLSpanElement;
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
  const cvvActualElement = document.getElementById("cvv-actual") as HTMLSpanElement;
  const spendingLimitInput = document.getElementById("spending-limit-input") as HTMLInputElement;
  const saveSpendingLimitButton = document.getElementById("save-spending-limit") as HTMLButtonElement;
  const transactionsBody = document.getElementById("transactions-body") as HTMLTableSectionElement;

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" }) +
      " " +
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })
    );
  }

  function updateCardDetails(): void {
    if (!card) {
      return;
    }
    cardIdElement.textContent = card.id;
    userNameElement.textContent = card.card_data.name_on_card;
    if (auth?.user.email) {
      userEmailElement.textContent = auth.user.email;
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
    spendingLimitInput.value = missingCardDetails.spendingLimit ? missingCardDetails.spendingLimit.toString() : "";
  }

  function renderTransactions(): void {
    transactionsBody.innerHTML = "";
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
    transactions.forEach((txn) => {
      const row = transactionsBody.insertRow();
      const idCell = row.insertCell();
      const dateCell = row.insertCell();
      const descriptionCell = row.insertCell();
      const amountCell = row.insertCell();
      const statusCell = row.insertCell();

      idCell.textContent = txn.id;
      dateCell.textContent = txn.date.toLocaleDateString() + " " + txn.date.toLocaleTimeString();
      descriptionCell.textContent = txn.description;
      amountCell.textContent = txn.amount;
      statusCell.textContent = txn.status;
    });
  }

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
    cardNumberMaskedElement.textContent = missingCardDetails.cardNumber ?? "N/A";
    revealCardNumberButton.style.display = "none";
  });

  revealCvvButton.addEventListener("click", () => {
    cvvMaskedElement.style.display = "none";
    cvvActualElement.textContent = missingCardDetails.cvv ?? "N/A";
    cvvActualElement.style.display = "inline";
    revealCvvButton.style.display = "none";
  });

  saveSpendingLimitButton.addEventListener("click", () => {
    const newLimit = parseFloat(spendingLimitInput.value);
    if (!isNaN(newLimit) && missingCardDetails.spendingLimit !== undefined) {
      missingCardDetails.spendingLimit = newLimit;
      showToast({ message: `Spending limit updated to ${newLimit}.`, type: "success" });
    } else {
      showToast({ message: "Invalid spending limit.", type: "error" });
    }
  });

  updateCardDetails();
  renderTransactions();
}

export async function toggleStatus(card: Card): Promise<boolean> {
  const auth = getUserAuthToken2();
  if (!auth) {
    return false;
  }

  const path = card.status === "Blocked" ? `/api/v1/cards/${card.id}/unblock` : `/api/v1/cards/${card.id}/block`;
  const cardStatusUrl = getWirexApiUrl(path, auth.isSandbox);
  const responseToggleStatus = await fetch(cardStatusUrl, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${auth.access_token}`,
      "X-User-Wallet": auth.wallet,
    },
  });

  if (responseToggleStatus.ok) {
    return true;
  }

  const errorData = await responseToggleStatus.json();
  console.error("Error in status toggle", JSON.stringify(errorData));
  return false;
}
