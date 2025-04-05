import { Card, User } from "../shared/wirex-types";

export function getCardSettingsHtml(cardId: string): string {
  return `
 <div class="container">
        <h2>Virtual Visa Card Details</h2>
        <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="read-only" id="card-id">${cardId}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">User ID:</span>
            <span class="read-only" id="user-id"></span>
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
            <button class="action-button" id="status-button"></button>
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
                    <th>ID</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody id="transactions-body">
                </tbody>
        </table>
    </div>

  `;
}

export function addCardSettingsEvents(cardId: string) {
  interface ToastOptions {
    message: string;
    type: "success" | "error" | "info";
  }

  interface MissingCardDetails {
    cardNumber?: string;
    cvv?: string;
    spendingLimit?: number;
    id?: string;
  }

  interface MissingUserDetails {
    id?: string;
  }

  // Example Missing Card Details
  const missingCardDetails: MissingCardDetails = {
    cardNumber: "4111111111111234",
    cvv: "123",
    spendingLimit: 300,
    id: "card123",
  };

  // Example Missing User Details
  const missingUserDetails: MissingUserDetails = {
    id: "user456",
  };

  interface Transaction {
    id: string;
    date: Date;
    description: string;
    amount: string;
    status: "Pending" | "Completed" | "Failed";
  }

  // Example Card Object
  const card: Card = {
    id: cardId,
    card_wallet_address: "0xabc123",
    status: "Active",
    status_reason: "",
    previous_status: null,
    card_data: {
      name_on_card: "John Doe",
      payment_system: "Visa",
      card_number_last_4: "1234",
      expiry_date: "12/25",
      format: "Virtual",
    },
    balances: [{ token_symbol: "USDT", token_address: "0xusdt", balance: 100, is_active: true }],
    limit: { daily_limit: 500, daily_usage: 150 },
    allowed_actions: [{ type: "Block", relative_path: "/api/cards/card123/block" }],
    created_at: "2024-07-20T15:00:00Z",
    updated_at: "2024-07-21T07:30:00Z",
  };

  // Example User Object
  const user: User = {
    id: "23432432",
    email: "john.doe@example.com",
    wallet_address: "0xdef456",
    residence_address: { country: "USA" },
    verification_status: "Verified",
    user_status: "Active",
    personal_info: { first_name: "John", last_name: "Doe", nationality: "American" },
    phone_number_data: { phone_number: "+15551234567" },
  };

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
  const userIdElement = document.getElementById("user-id") as HTMLSpanElement;
  const userEmailElement = document.getElementById("user-email") as HTMLSpanElement;
  const cardLimitElement = document.getElementById("card-limit") as HTMLSpanElement;
  const createdAtElement = document.getElementById("created-at") as HTMLSpanElement;
  const updatedAtElement = document.getElementById("updated-at") as HTMLSpanElement;
  const activeBalanceElement = document.getElementById("active-balance") as HTMLSpanElement;
  const statusButton = document.getElementById("status-button") as HTMLButtonElement;
  const cardNumberMaskedElement = document.getElementById("card-number-masked") as HTMLSpanElement;
  const revealCardNumberButton = document.getElementById("reveal-card-number") as HTMLButtonElement;
  const cardExpiryElement = document.getElementById("card-expiry") as HTMLSpanElement;
  const cvvMaskedElement = document.getElementById("cvv-masked") as HTMLSpanElement;
  const revealCvvButton = document.getElementById("reveal-cvv") as HTMLButtonElement;
  const cvvActualElement = document.getElementById("cvv-actual") as HTMLSpanElement;
  const spendingLimitInput = document.getElementById("spending-limit-input") as HTMLInputElement;
  const saveSpendingLimitButton = document.getElementById("save-spending-limit") as HTMLButtonElement;
  const transactionsBody = document.getElementById("transactions-body") as HTMLTableSectionElement;
  const toasterContainer = document.getElementById("toaster") as HTMLDivElement;

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" }) +
      " " +
      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })
    );
  }

  function showToast(options: ToastOptions): void {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.classList.add(`toast-${options.type}`);
    toast.textContent = options.message;
    toasterContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function updateCardDetails(): void {
    cardIdElement.textContent = card.id;
    userIdElement.textContent = missingUserDetails.id ?? "N/A";
    userEmailElement.textContent = user.email;
    cardLimitElement.textContent = `Daily: ${card.limit.daily_limit} / Used: ${card.limit.daily_usage}`;
    createdAtElement.textContent = formatDate(card.created_at);
    updatedAtElement.textContent = card.updated_at ? formatDate(card.updated_at) : "N/A";
    const activeBalance = card.balances.find((b) => b.token_symbol === "USDT" && b.is_active);
    activeBalanceElement.textContent = activeBalance ? `${activeBalance.balance} USDT` : "N/A";
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
    card.status = card.status === "Blocked" ? "Active" : "Blocked";
    statusButton.textContent = card.status === "Blocked" ? "Unblock" : "Block";
    showToast({ message: `Card has been ${card.status.toLowerCase()}.`, type: "success" });
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
