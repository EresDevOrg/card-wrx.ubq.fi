import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { Signer } from "@zerodev/sdk/types";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { PUBLIC_RPC, ZERODEV_RPC } from "./constants";

const bundlerTransport = http(ZERODEV_RPC);
const publicClient = createPublicClient({
  chain: getCurrentChain(),
  transport: http(PUBLIC_RPC),
});
const kernelPublicClient = createPublicClient({
  transport: bundlerTransport,
  chain: getCurrentChain(),
});
const kernelPaymasterClient = createZeroDevPaymasterClient({
  chain: getCurrentChain(),
  transport: http(ZERODEV_RPC),
});

export function getCurrentChain() {
  return baseSepolia;
}

export async function getKernelAccount(signer: Signer) {
  const simpleValidator = await signerToEcdsaValidator(kernelPublicClient, {
    signer,
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,
  });
  const account = await createKernelAccount(kernelPublicClient, {
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,
    plugins: {
      sudo: simpleValidator,
    },
  });

  return account;
}

export async function getKernelAccountClient(signer: Signer) {
  const client = createKernelAccountClient({
    account: await getKernelAccount(signer),
    chain: getCurrentChain(),
    bundlerTransport: bundlerTransport,
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymasterClient.sponsorUserOperation({ userOperation });
      },
    },
  });
  return client;
}

export async function getSmartAccountAddress(): Promise<string | null> {
  try {
    const client = await getKernelAccountClient(window.ethereum as Signer);

    const smartAccountAddress = client.account.address;
    console.log("Smart Account Address:", smartAccountAddress);

    // Check the account's bytecode.  EIP-196 defines that an account
    // with no code at its address is considered not deployed.
    const code = await publicClient.getCode({ address: smartAccountAddress });

    if (code && code !== "0x") {
      console.log("Smart account is already deployed.");
      return smartAccountAddress; // Or return smartAccountAddress; if you need the address
    } else {
      console.log("Smart account is not deployed yet.");
      return null;
    }
  } catch (error) {
    console.error("Error checking smart account deployment:", error);
    throw error;
  }
}
