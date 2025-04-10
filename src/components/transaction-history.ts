import { getSession } from "../shared/user-session";
import { getWirexApiUrl } from "../shared/utils";
import { showToast } from "./toaster";

// Define the TypeScript types based on the provided response body
interface MerchantAmount {
  amount: number;
  currency: string;
}

interface CardAmount {
  amount: number;
  currency: string;
}

interface MerchantDetails {
  name: string;
  website?: string;
  logo_url?: string;
  full_address?: string;
  latitude?: string;
  longitude?: string;
}

interface Transaction {
  id: string;
  card_id: string;
  merchant_amount: MerchantAmount;
  card_amount: CardAmount;
  merchant_details: MerchantDetails;
  comment: string;
  type: "POS" | "ePOS" | "ATM";
  direction: "Inbound" | "Outbound";
  created_at: string; // ISO 8601 date-time string
  updated_at: string | null; // ISO 8601 date-time string or null
  status: "Pending" | "Completed" | "Failed";
  status_reason?: string;
}

interface TransactionResponse {
  data: Transaction[];
  page_number: number;
  page_size: number;
}

export function getTransactionsHtml(): string {
  const session = getSession();
  if (!session?.cards?.length) {
    return `<div class="container">Transaction history not found.</div>`;
  }
  return `<div class="transactions-container">
            <h2>Transaction History</h2>
            <div class="table-responsive">
              <table class="transactions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Card ID</th>
                    <th>Merchant</th>
                    <th>Merchant Amount</th>
                    <th>Card Amount</th>
                    <th>Type</th>
                    <th>Direction</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody id="transactions-table-body">
                  <tr><td colSpan="9">Loading transactions...</td></tr>
                </tbody>
              </table>
            </div>
          </div>`;
}

export async function loadTransactions() {
  const transactionsTableBody = document.getElementById("transactions-table-body");
  if (!transactionsTableBody) {
    console.error("Transactions table body not found.");
    return;
  }
  const session = getSession();
  if (!session) {
    showToast({ message: "Please login to view your transactions.", type: "error" });
    return;
  }

  try {
    const response = await fetch(getWirexApiUrl(`/api/v1/transactions/card?page_number=0&page_size=100`, session.isSandbox), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-User-Wallet": session.wallet,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to fetch transactions:", error);
      showToast({ message: `Failed to fetch transactions: ${response.status}`, type: "error" });
      transactionsTableBody.innerHTML = `<tr><td colSpan="9">Failed to load transactions.</td></tr>`;
      return;
    }

    const transactionResponse: TransactionResponse = await response.json();
    renderTransactionsTable(transactionResponse.data, transactionsTableBody);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    showToast({ message: "An unexpected error occurred while loading transactions.", type: "error" });
    transactionsTableBody.innerHTML = `<tr><td colSpan="9">An unexpected error occurred.</td></tr>`;
  }
}

function renderTransactionsTable(transactions: Transaction[], tableBody: HTMLElement) {
  if (transactions.length === 0) {
    tableBody.innerHTML = `<tr><td colSpan="9">No transactions found.</td></tr>`;
    return;
  }

  const rowsHtml = transactions
    .map(
      (transaction) => `
    <tr>
      <td>${transaction.id}</td>
      <td>${transaction.card_id}</td>
      <td>${transaction.merchant_details.name}</td>
      <td>${transaction.merchant_amount.amount.toFixed(2)} ${transaction.merchant_amount.currency}</td>
      <td>${transaction.card_amount.amount.toFixed(2)} ${transaction.card_amount.currency}</td>
      <td>${transaction.type}</td>
      <td>${transaction.direction}</td>
      <td>${transaction.status}${transaction.status_reason ? ` (${transaction.status_reason})` : ""}</td>
      <td>${new Date(transaction.created_at).toLocaleDateString()} ${new Date(transaction.created_at).toLocaleTimeString()}</td>
    </tr>
  `
    )
    .join("");

  tableBody.innerHTML = rowsHtml;
}

export function addTransactionsEvents() {
  loadTransactions().catch(console.error);
}
