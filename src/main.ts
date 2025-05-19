import { createAppKit, EventsControllerState } from "@reown/appkit";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { AppKitNetwork } from "@reown/appkit/networks";
import { ethers } from "ethers";
import { providersUrl } from "./constants";
import { initializeState } from "./on-load";
import { handleRouting } from "./router";
import { useRpcHandler } from "./shared/use-rpc-handler";
import { authenticate, clearSession } from "./shared/user-session";
import { getEnv } from "./shared/utils";
import { wirexPayChain, wirexPayChainTestnet } from "./shared/wirex-pay-chain";

const projectId = "f8d73ee74421cc7790740554fa587b94";

const metadata = {
  name: "UbiquiCard",
  description: "A virtual card by Ubiquity",
  url: "https://card.ubq.fi",
  icons: ["https://avatars.githubusercontent.com/u/76412717"],
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [wirexPayChainTestnet, wirexPayChain];

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

    web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    // web3Provider signer will handle transaction signing
    userSigner = web3Provider.getSigner(appState.getAddress());

    const userAddress = await userSigner.getAddress();
    console.log("User address:", userAddress);

    await authenticate(userAddress);
  } else {
    userSigner = undefined;
  }
}

export function subscribeWalletEvents() {
  appState.subscribeCaipNetworkChange(() => {
    getEnv()
      .then((envData) => {
        console.log(`Switching to WirePayChain ${envData?.isSandbox === false ? "mainnet" : "testnet"} as configured.`);

        appState
          .switchNetwork(envData?.isSandbox === false ? wirexPayChain : wirexPayChainTestnet)
          .then(() => {
            clearSession();
            window.location.reload();
          })
          .catch(console.error);
      })
      .catch(console.error);
  });

  appState.subscribeEvents((event: EventsControllerState) => {
    if (event.data.event === "DISCONNECT_SUCCESS") {
      clearSession();
      window.location.reload();
    }

    if (event.data.event === "CONNECT_SUCCESS") {
      window.location.reload();
    }
  });
}

export async function mainModule() {
  try {
    await initializeProviderAndSigner();
    console.log("Provider:", provider);
    subscribeWalletEvents();

    await initializeState();
    console.log("State initialized");

    await handleRouting();
    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", () => {
        handleRouting().catch(console.error);
      });
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
