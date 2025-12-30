/*
 * Copyright © Aptos Foundation
 * Translated to Node.js using @aptos-labs/ts-sdk
 */

import {
    Aptos,
    AptosConfig,
    Network,
    MultiEd25519PublicKey,
    MultiEd25519Signature,
    AccountAuthenticatorMultiEd25519,
    AccountAddress,
    Account,
    Ed25519PublicKey,
} from '@aptos-labs/ts-sdk'
import { readFileSync } from 'fs'
import path from 'path'
import { aptosProvider } from './config'
const readline = require('readline')

// FAUCET_URL is handled internally by the SDK for testnet,
// but strictly speaking we initialize the client with the node url.

let shouldWait = true

// Helper to simulate Python's input() for waiting
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

async function wait() {
    if (shouldWait) {
        await new Promise((resolve) => {
            rl.question('\nPress Enter to continue...', () => {
                resolve('')
            })
        })
    }
}

async function main(shouldWaitInput = true) {
    // Network configuration
    // const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1'
    shouldWait = shouldWaitInput

    // Initialize Aptos client
    const config = new AptosConfig({
        network: process.env.APTOS_NETWORK as Network,
    })
    const aptos = new Aptos(config)

    ///////////// Add additional code here ///////////////

    const publicKeys = []
    const publicKeysStr = (process.env.MULTISIG_PUBLIC_KEYS as string).split(',')
    for (let pubkey of publicKeysStr) {
        publicKeys.push(new Ed25519PublicKey(pubkey.trim()))
    }

    // Create the MultiEd25519PublicKey
    const multisigPublicKey = new MultiEd25519PublicKey({
        publicKeys: publicKeys,
        threshold: Number(process.env.MULTISIG_THRESHOLD),
    })

    // Derive address from the multisig public key (via auth key)
    const derivedAddress = multisigPublicKey.authKey().derivedAddress()

    console.log(`\n=== ${process.env.MULTISIG_THRESHOLD}-of-${publicKeysStr.length} Multisig account ===`)
    console.log(`Account public key: ${multisigPublicKey.toString()}`)
    // to_crypto_bytes().hex() equivalent is implicitly handled by toString() or toUint8Array()
    console.log(`Account public key hex: ${Buffer.from(multisigPublicKey.toUint8Array()).toString('hex')}`)
    console.log(`Account address:    ${derivedAddress.toString()}`)

    // Force specific address as per Python code (though likely same as derived)

    const Multisig = Account.fromPrivateKey({
        privateKey: aptosProvider.getProfilePrivateKeyByName(process.env.UPGRADE_ACCOUNT as string),
    })
    const multisigAddress = AccountAddress.from(Multisig.accountAddress.toString())

    // Build the transaction
    console.log('\n=== Fetching sequence number from chain ===')

    const multisigAccountInfo = await aptos.getAccountInfo({
        accountAddress: multisigAddress,
    })

    const currentSequenceNumber = multisigAccountInfo.sequence_number
    console.log(`Current on-chain sequence number: ${currentSequenceNumber}`)
    await wait()

    const { metadataBytes, byteCode } = getPackageBytesToPublish(process.env.UPGRADE_PAYLOAD as string)
    const transaction = await aptos.publishPackageTransaction({
        account: multisigAddress,
        metadataBytes,
        moduleBytecode: byteCode,
    })

    // Sign the transaction
    // In Python: raw_transaction.keyed() is signed.
    // In TS SDK: we sign the transaction object directly.
    // account.signTransaction returns an AccountAuthenticator, we extract the signature.

    const signatures = []
    const bits = []
    const accounts = (process.env.MULTISIG_ACCOUNTS as string).split(',')
    accounts.sort()
    for (let account of accounts) {
        const result = account.trim().split(':')
        const multisigAccount = Account.fromPrivateKey({
            privateKey: aptosProvider.getProfilePrivateKeyByName(result[1]),
        })
        signatures.push(multisigAccount.signTransaction(transaction))
        bits.push(Number(result[0]))
    }
    // Helper to get hex string of signature

    // Combine the signatures
    // Python: sig_map = [(1, bob_signature), (2, chad_signature)]
    // We need to create a bitmap. Indices: Alice=0, Bob=1, Chad=2.
    // We are using Bob (1) and Chad (2).

    // Create bitmap for indices [1, 2]
    const bitmap = MultiEd25519Signature.createBitmap({ bits: bits })

    const multisigSignature = new MultiEd25519Signature({
        signatures: signatures,
        bitmap: bitmap,
    })

    // Create the authenticator
    const authenticator = new AccountAuthenticatorMultiEd25519(multisigPublicKey, multisigSignature)

    console.log('\n=== Submitting transfer transaction ===')

    try {
        // Submit the transaction with the custom multisig authenticator
        const pendingTx = await aptos.transaction.submit.simple({
            transaction: transaction,
            senderAuthenticator: authenticator,
        })

        console.log(`Transaction hash: ${pendingTx.hash}`)

        // Wait for transaction
        await aptos.transaction.waitForTransaction({
            transactionHash: pendingTx.hash,
        })
        console.log('Transaction executed successfully.')
    } catch (error) {
        console.error(
            'Submission failed (likely due to sequence number mismatch or insufficient funds on testnet):',
            error
        )
    }

    await wait()

    rl.close()
    process.exit(0)
}

function getPackageBytesToPublish(filePath: string) {
    // current working directory - the root folder of this repo
    const cwd = process.cwd()
    // target directory - current working directory + filePath (filePath JSON file is generated with the previous, compilePackage, CLI command)
    const modulePath = path.join(cwd, filePath)

    const jsonData = JSON.parse(readFileSync(modulePath, 'utf8'))

    const metadataBytes = jsonData.args[0].value
    const byteCode = jsonData.args[1].value

    return { metadataBytes, byteCode }
}

main()
