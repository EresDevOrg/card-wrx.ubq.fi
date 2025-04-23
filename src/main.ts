import { createAppKit, EventsControllerState } from "@reown/appkit";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { anvil, AppKitNetwork, mainnet } from "@reown/appkit/networks";
import { ethers } from "ethers";
import { providersUrl } from "./constants";
import { initializeState } from "./on-load";
import { handleRouting } from "./router";
import { useRpcHandler } from "./shared/use-rpc-handler";
import { authenticate, clearSession } from "./shared/user-session";
import { wirexPayChain, wirexPayChainTestnet } from "./shared/wirex-pay-chain";

const projectId = "f8d73ee74421cc7790740554fa587b94";

const metadata = {
  name: "UbiquiCard",
  description: "A virtual card by Ubiquity",
  url: "https://card.ubq.fi",
  icons: ["https://avatars.githubusercontent.com/u/76412717"],
};

let networks: [AppKitNetwork, ...AppKitNetwork[]];

if (window.location.hostname === "localhost" || window.location.hostname === "0.0.0.0") {
  console.log("enabling anvil");
  networks = [wirexPayChainTestnet, mainnet, wirexPayChain, anvil];
} else {
  networks = [wirexPayChainTestnet, mainnet, wirexPayChain];
}

export const appState = createAppKit({
  adapters: [new Ethers5Adapter()],
  networks: networks,
  defaultNetwork: wirexPayChainTestnet,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

// providers and signers
export let provider: ethers.providers.JsonRpcProvider | undefined;
export let userSigner: ethers.Signer | undefined;
let web3Provider: ethers.providers.Web3Provider | undefined;

export async function initializeProviderAndSigner() {
  const networkId = Number(appState.getChainId());
  if (networkId && providersUrl[networkId]) {
    // read-only provider for fetching
    provider = await useRpcHandler(networkId);
  } else {
    console.error("No provider URL found for the current network ID");
    provider = undefined;
  }

  // if user is connected, set up the signer using the injected provider (window.ethereum)
  if (appState.getIsConnectedState() && window.ethereum) {
    const ethereum = window.ethereum as ethers.providers.ExternalProvider;
    if (ethereum.request) {
      await ethereum.request({ method: "eth_requestAccounts" });
    }

    // Create a Web3Provider from window.ethereum
    web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    // web3Provider signer will handle transaction signing
    userSigner = web3Provider.getSigner(appState.getAddress());

    const userAddress = await userSigner.getAddress();
    console.log("User address:", userAddress);

    await authenticate(userAddress);

    (ethereum as { on: (e: string, f: () => void) => void }).on("accountsChanged", () => {
      clearSession();
      window.location.reload();
    });

    (ethereum as { on: (e: string, f: () => void) => void }).on("networkChanged", () => {
      clearSession();
      window.location.reload();
    });
  } else {
    userSigner = undefined;
  }
}

export function handleNetworkSwitch() {
  // network change listener
  appState.subscribeCaipNetworkChange((newState?: { id: string | number; name: string }) => {
    if (newState) {
      initializeProviderAndSigner()
        .then(() => {
          window.location.reload();
          console.log(`Network switched to ${newState.name} (${newState.id})`);
        })
        .catch(console.error);
    }
  });

  appState.subscribeEvents((event: EventsControllerState) => {
    if (event.data.event == "DISCONNECT_SUCCESS") {
      clearSession();
      window.location.reload();
    }
  });
}

export async function mainModule() {
  try {
    await initializeProviderAndSigner();
    console.log("Provider:", provider);
    handleNetworkSwitch();

    await initializeState();
    console.log("State initialized");

    const appkitState = appState.getState();
    if (appkitState.initialized) {
      await handleRouting();
      if (typeof window !== "undefined") {
        window.addEventListener("hashchange", () => {
          handleRouting().catch(console.error);
        });
      }
    }
  } catch (error) {
    console.error("Error in main: ", error);
  }
}

mainModule()
  .then(() => {
    console.log("mainModule loaded");
  })
  .catch((error) => {
    console.error(error);
  });
