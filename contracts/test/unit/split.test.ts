import {
  Address,
  addressFromContractId,
  AssetOutput,
  ContractState,
  DUST_AMOUNT,
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
import { PaymentSplit, PaymentSplitTypes } from '../../artifacts/ts'

const ONE_ALPH = 10n ** 18n

describe('unit tests', () => {
  let testContractId: string
  let testTokenId: string
  let testContractAddress: string
  let testUserAddress1: string
  let testUserAddress2: string
  let testUserShares1: bigint = 1n
  let testUserShares2: bigint = 2n
  let testParamsFixture: TestContractParams<PaymentSplitTypes.Fields, { account: Address; shares: bigint }>

  // We initialize the fixture variables before all tests
  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
    testContractId = randomContractId()
    testTokenId = testContractId
    testContractAddress = addressFromContractId(testContractId)
    const sig1 = await getSigner()
    const sig2 = await getSigner()
    testUserAddress1 = sig1.address
    testUserAddress2 = sig2.address
    testParamsFixture = {
      // a random address that the test contract resides in the tests
      address: testContractAddress,
      // assets owned by the test contract before a test
      initialAsset: { alphAmount: ONE_ALPH },
      // initial state of the test contract
      initialFields: {
        numPayees: 2n,
        numPayeesRegistered: 0n,
        totalReleased: 0n,
        totalShares: 0n,
        balance: 0n
      },
      // arguments to test the target function of the test contract
      testArgs: { account: '', shares: 0n },
      // assets owned by the caller of the function
      inputAssets: [{ address: testAddress, asset: { alphAmount: ONE_ALPH } }]
    }
  })

  it('test addPayee', async () => {
    const testParams = testParamsFixture

    const testResult = await PaymentSplit.tests.addPayee({
      ...testParams,
      // callerAddress: testUserAddress1,
      testArgs: { account: testUserAddress1, shares: testUserShares1 }
    })

    const contractState = testResult.contracts[0] as PaymentSplitTypes.State
    expect(contractState.fields.numPayees).toEqual(2)
    // double check the balance of the contract assets
    expect(contractState.asset).toEqual({ alphAmount: ONE_ALPH })

    // a `PayeeAdded` event is emitted when the test passes
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0] as PaymentSplitTypes.PayeeAddedEvent
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    // the name of the event is `PayeeAdded`
    expect(event.name).toEqual('PayeeAdded')
    // the first field of the event
    expect(event.fields.account).toEqual(testUserAddress1)
    // the second field of the event
    expect(event.fields.shares).toEqual(testUserShares1)

    // add another payee
    await PaymentSplit.tests.addPayee({
      ...testParams,
      // callerAddress: testUserAddress2,
      testArgs: { account: testUserAddress2, shares: testUserShares2 }
    })
  })

  it('test receive', async () => {
    const testParams = testParamsFixture
    const amount = ONE_ALPH / 2n
    const testResult = await PaymentSplit.tests.receive({ ...testParams, testArgs: { amount } })

    // only one contract involved in the test
    const contractState = testResult.contracts[0] as PaymentSplitTypes.State
    expect(contractState.fields.balance).toEqual(amount)
    // double check the balance of the contract assets
    expect(contractState.asset).toEqual({ alphAmount: ONE_ALPH })

    // three transaction outputs in total
    expect(testResult.txOutputs.length).toEqual(2)

    // the second transaction output is for the ALPH
    const alphOutput = testResult.txOutputs[1] as AssetOutput
    expect(alphOutput.type).toEqual('AssetOutput')
    expect(alphOutput.address).toEqual(testAddress)
    expect(alphOutput.alphAmount).toBeLessThan(ONE_ALPH) // the caller paid gas
    expect(alphOutput.tokens).toEqual([])

    // the third transaction output is for the contract
    const contractOutput = testResult.txOutputs[2]
    expect(contractOutput.type).toEqual('ContractOutput')
    expect(contractOutput.address).toEqual(testContractAddress)
    expect(contractOutput.alphAmount).toEqual(ONE_ALPH)

    // a `PaymentReceived` event is emitted when the test passes
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0] as PaymentSplitTypes.PaymentReceivedEvent
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    // the name of the event is `PaymentReceived`
    expect(event.name).toEqual('PaymentReceived')
    // the first field of the event
    expect(event.fields.from).toEqual(testAddress)
    // the second field of the event
    expect(event.fields.amount).toEqual(1n)

    // the test framework support debug messages too
    // debug will be disabled automatically at the deployment to real networks
    expect(testResult.debugMessages).toEqual([
      { contractAddress: testContractAddress, message: 'The current balance is 10' }
    ])
  })

  it('test release', async () => {
    const testParams = testParamsFixture
    const testResult = await PaymentSplit.tests.release(testParams)

    // only one contract involved in the test
    const contractState = testResult.contracts[0] as PaymentSplitTypes.State
    expect(contractState.address).toEqual(testContractAddress)
    expect(contractState.fields.totalReleased).toEqual(ONE_ALPH)
    // the balance of the test token is: 10 - 1 = 9
    expect(contractState.fields.balance).toEqual(9n)
    // double check the balance of the contract assets
    expect(contractState.asset).toEqual({ alphAmount: ONE_ALPH })

    // three transaction outputs in total
    expect(testResult.txOutputs.length).toEqual(3)

    // the first transaction output is for the token
    const tokenOutput = testResult.txOutputs[0] as AssetOutput
    expect(tokenOutput.type).toEqual('AssetOutput')
    expect(tokenOutput.address).toEqual(testAddress)
    expect(tokenOutput.alphAmount).toEqual(DUST_AMOUNT) // dust amount

    // the second transaction output is for the ALPH
    const alphOutput = testResult.txOutputs[1] as AssetOutput
    expect(alphOutput.type).toEqual('AssetOutput')
    expect(alphOutput.address).toEqual(testAddress)
    expect(alphOutput.alphAmount).toBeLessThan(ONE_ALPH) // the caller paid gas
    expect(alphOutput.tokens).toEqual([])

    // the third transaction output is for the contract
    const contractOutput = testResult.txOutputs[2]
    expect(contractOutput.type).toEqual('ContractOutput')
    expect(contractOutput.address).toEqual(testContractAddress)
    expect(contractOutput.alphAmount).toEqual(ONE_ALPH)

    // a `PaymentReleased` event is emitted when the test passes
    expect(testResult.events.length).toEqual(1)
    const event = testResult.events[0] as PaymentSplitTypes.PaymentReleasedEvent
    // the event is emitted by the test contract
    expect(event.contractAddress).toEqual(testContractAddress)
    // the name of the event is `PaymentReleased`
    expect(event.name).toEqual('PaymentReleased')
    // the first field of the event
    expect(event.fields.to).toEqual(testAddress)
    // the second field of the event
    expect(event.fields.amount).toEqual(1n)

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
      1
    )
  })
})
