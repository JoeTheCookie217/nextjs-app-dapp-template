import {
  Address,
  addressFromContractId,
  AssetOutput,
  ContractState,
  DUST_AMOUNT,
  groupOfAddress,
  TestContractParams,
  web3
} from '@alephium/web3'
import {
  expectAssertionError,
  getSigner,
  randomContractAddress,
  randomContractId,
  testAddress
} from '@alephium/web3-test'
import { TokenVesting, TokenVestingInstance, TokenVestingTypes } from '../../artifacts/ts'
import * as base58 from 'bs58'
import { randomBytes } from 'crypto'
import { PrivateKeyWallet } from '@alephium/web3-wallet'

const ONE_ALPH = 10n ** 18n

// copied from alephium-dex example
export function randomP2PKHAddress(groupIndex = 0): string {
  const prefix = Buffer.from([0x00])
  const bytes = Buffer.concat([prefix, randomBytes(32)])
  const address = base58.encode(bytes)
  if (groupOfAddress(address) === groupIndex) {
    return address
  }
  return randomP2PKHAddress(groupIndex)
}

const ONE_HOUR = 1000 * 60 * 60

describe('unit tests', () => {
  let testContractId: string
  let testTokenId: string
  let testContractAddress: string
  let owner: PrivateKeyWallet
  let testUserAddress1: string
  let testUserAddress2: string
  let testParamsFixture: TestContractParams<TokenVestingTypes.Fields>
  let tokenVesting: TokenVestingInstance

  // We initialize the fixture variables before all tests
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    testContractId = randomContractId()
    testTokenId = testContractId
    testContractAddress = addressFromContractId(testContractId)
    const sig1 = await getSigner()
    const sig2 = await getSigner()
    owner = sig1
    testUserAddress1 = sig1.address
    testUserAddress2 = sig2.address
    testParamsFixture = {
      // a random address that the test contract resides in the tests
      address: testContractAddress,
      // assets owned by the test contract before a test
      initialAsset: { alphAmount: ONE_ALPH },
      // initial state of the test contract
      initialFields: {
        beneficiary: testUserAddress2,
        duration: BigInt(ONE_HOUR),
        start: BigInt(Date.now()),
        balance: 0n
      },
      // arguments to test the target function of the test contract
      testArgs: {},
      // assets owned by the caller of the function
      inputAssets: [{ address: testUserAddress1, asset: { alphAmount: ONE_ALPH } }]
    }
  })

  beforeEach(async () => {
    const now = Date.now()
    tokenVesting = (await TokenVesting.deploy(owner, { ...testParamsFixture })).contractInstance
  })

  it('test release', async () => {
    const testParams = testParamsFixture
    const testResult = await TokenVesting.tests.release({
      ...testParams,
      // callerAddress: testUserAddress1,
      testArgs: { token: testUserAddress1 }
    })

    const contractState = testResult.contracts[0] as TokenVestingTypes.State
    // expect(contractState.fields.).toEqual(2n)

    // a `ERC20Released` event is emitted when the test passes

    console.log(testResult.events)
    expect(testResult.events.length).toEqual(2) // creation and payee added
    const event = testResult.events.find((e) => e.name == 'ERC20Released') as TokenVestingTypes.ERC20ReleasedEvent
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    expect(event.name).toEqual('ERC20Released')
    expect(event.fields.amount).toEqual(testUserAddress1)
  })
})
