import { getSession } from "../shared/user-session";
import { showToast } from "./toaster";

export function getCardsHtml(): string {
  return `<div class="card-list"></div>`;
}

export function addCardsEvents() {
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

  const session = getSession();
  if (!session) {
    showToast({ message: "Register to get your card.", type: "error" });
    return;
  }
  if (session && session.cards?.length === 0) {
    showToast({ message: "You have no cards.", type: "error" });
    return;
  }

  session.cards?.forEach((card) => {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");

    const cardImageContainer = document.createElement("div");
    cardImageContainer.classList.add("card-image-container");
    cardImageContainer.innerHTML = genericCardSvg;
    cardContainer.appendChild(cardImageContainer);

    const cardDetails = document.createElement("div");
    cardDetails.classList.add("card-details");
    cardDetails.innerHTML = `
        <p><strong>${card.card_data.format} ${card.card_data.payment_system} :</strong> <span class="card-id">${card.card_data.card_number_last_4} ${card.card_data.expiry_date}</span></p>
        <p><strong>Status:</strong> <span class="card-status">${card.status}</span></p>
        <p><strong>Balances:</strong>
            <ul class="balances-list">
                ${card.balances.map((balance) => `<li><strong>${balance.token_symbol}:</strong> <span class="balance-${balance.token_symbol.toLowerCase()}">${balance.balance.toFixed(2)}</span> <span>${balance.is_active ? "(Active)" : ""}</span></li>`).join("")}
            </ul>
        </p>
        <p><strong>Limit:</strong> Daily: <span class="daily-limit">${card.limit.daily_limit ? card.limit.daily_limit : 0}</span> / Used: <span class="daily-usage">${card.limit.daily_usage ? card.limit.daily_usage : 0}</span></p>
        <p><strong>Created At:</strong> <span class="created-at">${card.created_at}</span></p>
        <p><strong>Updated At:</strong> <span class="updated-at">${card.updated_at ? `${card.updated_at}` : "N/A"}</span></p>
        <p><strong>ID:</strong> <span class="card-id">${card.id}</span></p>
        
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
