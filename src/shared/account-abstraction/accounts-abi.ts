export const accountsAbi = [
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "AccountCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum IAccounts.AccountStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "AccountStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum IAccounts.AccountVerificationStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "AccountVerificationStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "UserAccountCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum IAccounts.AccountStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "UserAccountStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum IAccounts.AccountVerificationStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "UserAccountVerificationStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum IAccounts.WalletConfirmationStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "WalletConfirmationStatusChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "WalletLinked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "role",
        type: "string",
      },
    ],
    name: "WalletRoleAssigned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "WalletRoleRemoved",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        internalType: "string",
        name: "role",
        type: "string",
      },
    ],
    name: "assignWalletRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "enum IAccounts.AccountStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "changeAccountStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "enum IAccounts.AccountVerificationStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "changeAccountVerificationStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "enum IAccounts.AccountStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "changeUserAccountStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "enum IAccounts.AccountVerificationStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "changeUserAccountVerificationStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        internalType: "enum IAccounts.WalletConfirmationStatus",
        name: "status",
        type: "uint8",
      },
    ],
    name: "changeWalletConfirmationStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "createAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "createAccountFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
    ],
    name: "createUserAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
    ],
    name: "createUserAccountWithWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "getAccount",
    outputs: [
      {
        components: [
          {
            internalType: "enum IAccounts.AccountStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum IAccounts.AccountVerificationStatus",
            name: "verificationStatus",
            type: "uint8",
          },
        ],
        internalType: "struct IAccounts.Account",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
    ],
    name: "getUserAccount",
    outputs: [
      {
        components: [
          {
            internalType: "enum IAccounts.AccountStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "enum IAccounts.AccountVerificationStatus",
            name: "verificationStatus",
            type: "uint8",
          },
        ],
        internalType: "struct IAccounts.Account",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "getWallet",
    outputs: [
      {
        components: [
          {
            internalType: "enum IAccounts.WalletConfirmationStatus",
            name: "confirmationStatus",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        internalType: "struct IAccounts.Wallet",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "register",
        type: "address",
      },
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
    ],
    name: "linkWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "migrateAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "parentEntity",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "removeWalletRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
