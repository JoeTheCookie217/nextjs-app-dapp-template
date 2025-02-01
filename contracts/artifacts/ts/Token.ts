/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  Asset,
  ContractInstance,
  getContractEventsCurrentCount,
  TestContractParamsWithoutMaps,
  TestContractResultWithoutMaps,
  SignExecuteContractMethodParams,
  SignExecuteScriptTxResult,
  signExecuteMethod,
  addStdIdToFields,
  encodeContractFields,
  Narrow,
} from "@alephium/web3";
import { default as TokenContractJson } from "../Token.ral.json";
import { getContractByCodeHash, registerContract } from "./contracts";

// Custom types for the contract
export namespace TokenTypes {
  export type Fields = {
    totalSupply: bigint;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    getSymbol: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getName: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getDecimals: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getTotalSupply: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
  export type MulticallReturnType<Callss extends MultiCallParams[]> = {
    [index in keyof Callss]: MultiCallResults<Callss[index]>;
  };

  export interface SignExecuteMethodTable {
    getSymbol: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getName: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getDecimals: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getTotalSupply: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<TokenInstance, TokenTypes.Fields> {
  encodeFields(fields: TokenTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      []
    );
  }

  at(address: string): TokenInstance {
    return new TokenInstance(address);
  }

  tests = {
    getSymbol: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getSymbol", params, getContractByCodeHash);
    },
    getName: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getName", params, getContractByCodeHash);
    },
    getDecimals: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getDecimals", params, getContractByCodeHash);
    },
    getTotalSupply: async (
      params: Omit<
        TestContractParamsWithoutMaps<TokenTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getTotalSupply", params, getContractByCodeHash);
    },
  };

  stateForTest(initFields: TokenTypes.Fields, asset?: Asset, address?: string) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const Token = new Factory(
  Contract.fromJson(
    TokenContractJson,
    "",
    "3ef6b0e92af5358d2f9872825f6e90387fea4a832864748d71e43437329e37e0",
    []
  )
);
registerContract(Token);

// Use this class to interact with the blockchain
export class TokenInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<TokenTypes.State> {
    return fetchContractState(Token, this);
  }

  view = {
    getSymbol: async (
      params?: TokenTypes.CallMethodParams<"getSymbol">
    ): Promise<TokenTypes.CallMethodResult<"getSymbol">> => {
      return callMethod(
        Token,
        this,
        "getSymbol",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getName: async (
      params?: TokenTypes.CallMethodParams<"getName">
    ): Promise<TokenTypes.CallMethodResult<"getName">> => {
      return callMethod(
        Token,
        this,
        "getName",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDecimals: async (
      params?: TokenTypes.CallMethodParams<"getDecimals">
    ): Promise<TokenTypes.CallMethodResult<"getDecimals">> => {
      return callMethod(
        Token,
        this,
        "getDecimals",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTotalSupply: async (
      params?: TokenTypes.CallMethodParams<"getTotalSupply">
    ): Promise<TokenTypes.CallMethodResult<"getTotalSupply">> => {
      return callMethod(
        Token,
        this,
        "getTotalSupply",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getSymbol: async (
      params: TokenTypes.SignExecuteMethodParams<"getSymbol">
    ): Promise<TokenTypes.SignExecuteMethodResult<"getSymbol">> => {
      return signExecuteMethod(Token, this, "getSymbol", params);
    },
    getName: async (
      params: TokenTypes.SignExecuteMethodParams<"getName">
    ): Promise<TokenTypes.SignExecuteMethodResult<"getName">> => {
      return signExecuteMethod(Token, this, "getName", params);
    },
    getDecimals: async (
      params: TokenTypes.SignExecuteMethodParams<"getDecimals">
    ): Promise<TokenTypes.SignExecuteMethodResult<"getDecimals">> => {
      return signExecuteMethod(Token, this, "getDecimals", params);
    },
    getTotalSupply: async (
      params: TokenTypes.SignExecuteMethodParams<"getTotalSupply">
    ): Promise<TokenTypes.SignExecuteMethodResult<"getTotalSupply">> => {
      return signExecuteMethod(Token, this, "getTotalSupply", params);
    },
  };

  async multicall<Calls extends TokenTypes.MultiCallParams>(
    calls: Calls
  ): Promise<TokenTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends TokenTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<TokenTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends TokenTypes.MultiCallParams | TokenTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(Token, this, callss, getContractByCodeHash);
  }
}
