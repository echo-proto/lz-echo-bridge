import { configDotenv } from 'dotenv'
import path from 'path'
import { AptosProvider } from '../wrappers/aptosProvider'
import { Account } from '@aptos-labs/ts-sdk'

const envPath = path.resolve(__dirname, '../../.env')
configDotenv({
    path: envPath,
})

export const aptosProvider = new AptosProvider()

export const Multisig0 = Account.fromPrivateKey({
    privateKey: aptosProvider.getProfilePrivateKeyByName('multisig_0'),
})
export const Multisig0AccountAddress = Multisig0.accountAddress.toString()

export const Multisig1 = Account.fromPrivateKey({
    privateKey: aptosProvider.getProfilePrivateKeyByName('multisig_1'),
})
export const Multisig1AccountAddress = Multisig1.accountAddress.toString()

export const Multisig2 = Account.fromPrivateKey({
    privateKey: aptosProvider.getProfilePrivateKeyByName('multisig_2'),
})
export const Multisig2AccountAddress = Multisig2.accountAddress.toString()
