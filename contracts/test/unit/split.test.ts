import {
  Address,
  addressFromContractId,
  AssetOutput,
  ContractState,
  DUST_AMOUNT,
  TestContractParams,
  web3
} from '@alephium/web3'
import { expectAssertionError, randomContractAddress, randomContractId, testAddress } from '@alephium/web3-test'
import { PaymentSplit, PaymentSplitTypes } from '../../artifacts/ts'

describe('unit tests', () => {
  let testContractId: string
  let testTokenId: string
  let testContractAddress: string
  let testParamsFixture: TestContractParams<PaymentSplitTypes.Fields, { account: Address; shares: bigint }>

  // We initialize the fixture variables before all tests
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    testContractId = randomContractId()
    testTokenId = testContractId
    testContractAddress = addressFromContractId(testContractId)
    testParamsFixture = {
      // a random address that the test contract resides in the tests
      address: testContractAddress,
      // assets owned by the test contract before a test
      initialAsset: { alphAmount: 10n ** 18n, tokens: [{ id: testTokenId, amount: 10n }] },
      // initial state of the test contract
      initialFields: {
        totalReleased: 0n,
        totalShares: 0n,
        balance: 0n
      },
      // arguments to test the target function of the test contract
      testArgs: { account: randomContractAddress(), shares: 0n },
      // assets owned by the caller of the function
      inputAssets: [{ address: testAddress, asset: { alphAmount: 10n ** 18n } }]
    }
  })

  it('test release', async () => {
    const testParams = testParamsFixture
    const testResult = await PaymentSplit.tests.addPayeeInternal(testParams)

    // only one contract involved in the test
    const contractState = testResult.contracts[0] as PaymentSplitTypes.State
    expect(contractState.address).toEqual(testContractAddress)
    expect(contractState.fields.totalReleased).toEqual(10n ** 18n)
    // the balance of the test token is: 10 - 1 = 9
    expect(contractState.fields.balance).toEqual(9n)
    // double check the balance of the contract assets
    expect(contractState.asset).toEqual({ alphAmount: 10n ** 18n, tokens: [{ id: testTokenId, amount: 9n }] })

    // three transaction outputs in total
    expect(testResult.txOutputs.length).toEqual(3)

    // the first transaction output is for the token
    const tokenOutput = testResult.txOutputs[0] as AssetOutput
    expect(tokenOutput.type).toEqual('AssetOutput')
    expect(tokenOutput.address).toEqual(testAddress)
    expect(tokenOutput.alphAmount).toEqual(DUST_AMOUNT) // dust amount
    // the caller withdrawn 1 token from the contract
    expect(tokenOutput.tokens).toEqual([{ id: testTokenId, amount: 1n }])

    // the second transaction output is for the ALPH
    const alphOutput = testResult.txOutputs[1] as AssetOutput
    expect(alphOutput.type).toEqual('AssetOutput')
    expect(alphOutput.address).toEqual(testAddress)
    expect(alphOutput.alphAmount).toBeLessThan(10n ** 18n) // the caller paid gas
    expect(alphOutput.tokens).toEqual([])

    // the third transaction output is for the contract
    const contractOutput = testResult.txOutputs[2]
    expect(contractOutput.type).toEqual('ContractOutput')
    expect(contractOutput.address).toEqual(testContractAddress)
    expect(contractOutput.alphAmount).toEqual(10n ** 18n)
    // the contract has transferred 1 token to the caller
    expect(contractOutput.tokens).toEqual([{ id: testTokenId, amount: 9n }])

    // a `Withdraw` event is emitted when the test passes
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0] as PaymentSplitTypes.PayeeAddedEvent
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    // the name of the event is `Withdraw`
    expect(event.name).toEqual('')
    // the first field of the event
    expect(event.fields.account).toEqual(testAddress)
    // the second field of the event
    expect(event.fields.shares).toEqual(1n)

    // the test framework support debug messages too
    // debug will be disabled automatically at the deployment to real networks
    expect(testResult.debugMessages).toEqual([
      { contractAddress: testContractAddress, message: 'The current balance is 10' }
    ])
  })

  it('test release', async () => {
    const testParams = testParamsFixture
    const testResult = await PaymentSplit.tests.addPayeeInternal(testParams)

    // only one contract involved in the test
    const contractState = testResult.contracts[0] as PaymentSplitTypes.State
    expect(contractState.address).toEqual(testContractAddress)
    expect(contractState.fields.totalReleased).toEqual(10n ** 18n)
    // the balance of the test token is: 10 - 1 = 9
    expect(contractState.fields.balance).toEqual(9n)
    // double check the balance of the contract assets
    expect(contractState.asset).toEqual({ alphAmount: 10n ** 18n, tokens: [{ id: testTokenId, amount: 9n }] })

    // three transaction outputs in total
    expect(testResult.txOutputs.length).toEqual(3)

    // the first transaction output is for the token
    const tokenOutput = testResult.txOutputs[0] as AssetOutput
    expect(tokenOutput.type).toEqual('AssetOutput')
    expect(tokenOutput.address).toEqual(testAddress)
    expect(tokenOutput.alphAmount).toEqual(DUST_AMOUNT) // dust amount
    // the caller withdrawn 1 token from the contract
    expect(tokenOutput.tokens).toEqual([{ id: testTokenId, amount: 1n }])

    // the second transaction output is for the ALPH
    const alphOutput = testResult.txOutputs[1] as AssetOutput
    expect(alphOutput.type).toEqual('AssetOutput')
    expect(alphOutput.address).toEqual(testAddress)
    expect(alphOutput.alphAmount).toBeLessThan(10n ** 18n) // the caller paid gas
    expect(alphOutput.tokens).toEqual([])

    // the third transaction output is for the contract
    const contractOutput = testResult.txOutputs[2]
    expect(contractOutput.type).toEqual('ContractOutput')
    expect(contractOutput.address).toEqual(testContractAddress)
    expect(contractOutput.alphAmount).toEqual(10n ** 18n)
    // the contract has transferred 1 token to the caller
    expect(contractOutput.tokens).toEqual([{ id: testTokenId, amount: 9n }])

    // a `Withdraw` event is emitted when the test passes
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0] as PaymentSplitTypes.PayeeAddedEvent
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    // the name of the event is `Withdraw`
    expect(event.name).toEqual('')
    // the first field of the event
    expect(event.fields.account).toEqual(testAddress)
    // the second field of the event
    expect(event.fields.shares).toEqual(1n)

    // the test framework support debug messages too
    // debug will be disabled automatically at the deployment to real networks
    expect(testResult.debugMessages).toEqual([
      { contractAddress: testContractAddress, message: 'The current balance is 10' }
    ])
  })

  it('test assert', async () => {
    // test that assertion failed in the withdraw function
    await expectAssertionError(
      PaymentSplit.tests.addPayeeInternal({
        ...testParamsFixture,
        testArgs: { shares: 0n, account: randomContractAddress() }
      }),
      testContractAddress,
      0
    )
  })
})
