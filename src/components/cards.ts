import { getUserAuthToken2 } from "../shared/user-auth";
import { showToast } from "./toaster";

export function getCardsHtml(): string {
  return `
  <div class="card-list">
            
    </div>

  `;
}

export function addCardsEvents() {
  // Sample data for demonstration
  // const virtualCards = [
  //   {
  //     id: "card123",
  //     status: "Active",
  //     balances: [
  //       { token_symbol: "USD", token_address: "usd_address", balance: 125.5, is_active: true },
  //       { token_symbol: "EUR", token_address: "eur_address", balance: 80.2, is_active: true },
  //     ],
  //     limit: { daily_limit: 500, daily_usage: 150 },
  //     created_at: "2024-07-20T10:00:00Z",
  //     updated_at: "2024-07-21T14:30:00Z",
  //   },
  //   {
  //     id: "card456",
  //     status: "NotActivated",
  //     balances: [{ token_symbol: "USD", token_address: "usd_address", balance: 0.0, is_active: true }],
  //     limit: { daily_limit: 1000, daily_usage: 0 },
  //     created_at: "2025-01-15T09:15:00Z",
  //     updated_at: null,
  //   },
  //   {
  //     id: "card789",
  //     status: "Blocked",
  //     balances: [{ token_symbol: "USD", token_address: "usd_address", balance: 55.75, is_active: true }],
  //     limit: { daily_limit: 200, daily_usage: 200 },
  //     created_at: "2024-11-01T16:45:00Z",
  //     updated_at: "2024-11-05T08:00:00Z",
  //   },
  //   // Add more card objects here
  // ];

  const cardListDiv = document.querySelector(".card-list");
  const genericCardSvg = `
    <svg class="card-image" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" rx="15" fill="#293462"/>
        <rect x="20" y="150" width="80" height="30" rx="5" fill="#fff"/>
        <text x="30" y="170" font-size="16" fill="#000">VISA</text>
        <rect x="220" y="140" width="80" height="40" rx="8" fill="#4ECDC4"/>
        <circle cx="250" cy="160" r="12" fill="#FFF6A5"/>
        <circle cx="270" cy="160" r="12" fill="#FF6B6B" opacity="0.8"/>
    </svg>
`;

  const auth = getUserAuthToken2();
  if (!auth) {
    showToast({ message: "Please login to view your cards.", type: "error" });
    return;
  }

  auth.cards?.forEach((card) => {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");

    const cardImageContainer = document.createElement("div");
    cardImageContainer.classList.add("card-image-container");
    cardImageContainer.innerHTML = genericCardSvg;
    cardContainer.appendChild(cardImageContainer);

    const cardDetails = document.createElement("div");
    cardDetails.classList.add("card-details");
    cardDetails.innerHTML = `
        <p><strong>ID:</strong> <span class="card-id">${card.id}</span></p>
        <p><strong>Status:</strong> <span class="card-status">${card.status}</span></p>
        <p><strong>Balances:</strong>
            <ul class="balances-list">
                ${card.balances.map((balance) => `<li><strong>${balance.token_symbol}:</strong> <span class="balance-${balance.token_symbol.toLowerCase()}">${balance.balance.toFixed(2)}</span></li>`).join("")}
            </ul>
        </p>
        <p><strong>Limit:</strong> Daily: <span class="daily-limit">${card.limit.daily_limit}</span> / Used: <span class="daily-usage">${card.limit.daily_usage}</span></p>
        <p><strong>Created At:</strong> <span class="created-at">${new Date(card.created_at).toLocaleDateString()} ${new Date(card.created_at).toLocaleTimeString()}</span></p>
        <p><strong>Updated At:</strong> <span class="updated-at">${card.updated_at ? `${new Date(card.updated_at).toLocaleDateString()} ${new Date(card.updated_at).toLocaleTimeString()}` : "N/A"}</span></p>
    `;
    cardContainer.appendChild(cardDetails);

    const cardActions = document.createElement("div");
    cardActions.classList.add("card-actions");
    const settingsButton = document.createElement("a");
    settingsButton.href = `#/cards/${card.id}`;
    settingsButton.innerHTML = '<button class="settings-button button">Settings</button>';
    cardActions.appendChild(settingsButton);
    cardContainer.appendChild(cardActions);

    cardListDiv?.appendChild(cardContainer);
  });
}
