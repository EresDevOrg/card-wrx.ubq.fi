import { setupRouter } from "./router";
import { initializeState } from "./on-load";
import { createAppKit } from "@reown/appkit";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { anvil, AppKitNetwork, mainnet } from "@reown/appkit/networks";
import { ethers } from "ethers";
import { handleRouting } from "./router";
import { providersUrl } from "./constants";
import { useRpcHandler } from "./shared/use-rpc-handler";
import { wirexPayChain, wirexPayChainTestnet } from "./shared/wirex-pay-chain";

const projectId = "415760038f8e330de4868120be3205b8";

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

export const getNetworkId = () => appState.getCaipNetworkId()?.toString();

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
  console.log("main appState.getIsConnectedState()", appState.getIsConnectedState());
  if (appState.getIsConnectedState() && window.ethereum) {
    const ethereum = window.ethereum as ethers.providers.ExternalProvider;
    if (ethereum.request) {
      await ethereum.request({ method: "eth_requestAccounts" });
    }

    // Create a Web3Provider from window.ethereum
    web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    // web3Provider signer will handle transaction signing
    userSigner = web3Provider.getSigner(appState.getAddress());

    console.log("User address:", await userSigner.getAddress());
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

  // wallet connection listener
  appState.subscribeWalletInfo(() => {
    initializeProviderAndSigner().catch(console.error);
  });
}

setupRouter();

export async function mainModule() {
  try {
    await initializeProviderAndSigner();
    console.log("Provider:", provider);

    handleNetworkSwitch();

    await initializeState();
    console.log("State initialized");

    await handleRouting();
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
