import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toPermissionValidator } from "@zerodev/permissions";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient, getUserOperationGasPrice } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { Signer } from "@zerodev/sdk/types";
import { createPublicClient, EIP1193Provider, Hex, http } from "viem";
import { baseSepolia } from "viem/chains";
import { contractRegistryAddress, PUBLIC_RPC, ZERODEV_RPC } from "./constants";
import { contractRegistryAbi } from "./contract-registry-abi";

const bundlerTransport = http(ZERODEV_RPC);
export const publicClient = createPublicClient({
  chain: getCurrentChain(),
  transport: http(PUBLIC_RPC),
});
export const kernelPublicClient = createPublicClient({
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

export async function getClientWithDelayPolicy(accountAddress: string) {
  // Recreate AA client using its initial address and execution delay sudo policy
  const eip1193Provider = getEip1193Provider();
  const validator = await createExecutionDelayValidator(eip1193Provider);
  const account = await createKernelAccount(kernelPublicClient, {
    entryPoint: getEntryPoint("0.7"),
    address: accountAddress as Hex,
    kernelVersion: KERNEL_V3_1,
    plugins: {
      sudo: validator,
    },
  });

  const client = createKernelAccountClient({
    account: account,
    chain: getCurrentChain(),
    bundlerTransport: bundlerTransport,
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymasterClient.sponsorUserOperation({ userOperation });
      },
    },
    userOperation: {
      estimateFeesPerGas: async ({ bundlerClient }) => {
        return getUserOperationGasPrice(bundlerClient);
      },
    },
  });

  return client;
}

export function getEip1193Provider(): EIP1193Provider {
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found");
  }
  // window.ethereum is EIP1193Provider, accepted as Signer by ZeroDev/sdk
  // https://docs.zerodev.app/sdk/signers/eoa#eip-1193-provider-integration
  return window.ethereum as EIP1193Provider;
}

export async function getSmartAccountAddress(): Promise<string | null> {
  try {
    const eip1193Provider = getEip1193Provider();
    const client = await getKernelAccountClient(eip1193Provider as Signer);

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

export async function createExecutionDelayValidator(signer: Signer) {
  const policyAddress = (await publicClient.readContract({
    address: contractRegistryAddress,
    abi: contractRegistryAbi, // Can be retrieved using block explorer of your liking
    functionName: "contractByName",
    args: ["ExecutionDelayPolicy"],
  })) as `0x${string}`;
  const rootPolicy = toSudoPolicy({
    policyAddress,
  });

  const res = await toPermissionValidator(kernelPublicClient, {
    entryPoint: getEntryPoint("0.7"),
    signer: await toECDSASigner({ signer: signer }),
    kernelVersion: KERNEL_V3_1,
    policies: [rootPolicy],
  });

  res.address = policyAddress;
  return res;
}
