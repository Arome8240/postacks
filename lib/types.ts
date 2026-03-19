export type ArgType =
  | "uint128"
  | "int128"
  | "bool"
  | "principal"
  | "string-ascii"
  | "string-utf8"
  | "buffer"
  | "none"
  | "optional"
  | "tuple"
  | "list";

export interface FunctionArg {
  name: string;
  type: ArgType | string;
}

export interface ContractFunction {
  name: string;
  access: "read_only" | "public" | "private";
  args: FunctionArg[];
  outputs: { type: string };
}

export interface ContractABI {
  functions: ContractFunction[];
  variables: any[];
  maps: any[];
  fungible_tokens: any[];
  non_fungible_tokens: any[];
}

export interface SavedRequest {
  id: string;
  name: string;
  contractAddress: string;
  contractName: string;
  functionName: string;
  args: Record<string, string>;
  network: "mainnet" | "testnet";
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  requests: SavedRequest[];
  createdAt: number;
}
