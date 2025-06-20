import inquirer from 'inquirer'

import { OFTFactory, TaskContext, getConnection } from '@layerzerolabs/devtools-move'
import { EndpointId, getNetworkForChainId } from '@layerzerolabs/lz-definitions'
import { sendFromMoveVm } from '@layerzerolabs/oft-move'
import { OAppOmniGraphHardhat } from '@layerzerolabs/toolbox-hardhat'

import config from '../move.layerzero.config'

async function main() {
    const oAppAddress = '0x8dac4489ebed5b6bb43c88a7fd36dc5caa89c64e7e7a2581ae5f9aec2738bc13'
    const amount_ld = 1e8
    const min_amount_ld = 1e7
    const src_address = '0x8dac4489ebed5b6bb43c88a7fd36dc5caa89c64e7e7a2581ae5f9aec2738bc13'
    const to_address = '0xBc6F1FDf19618Bc6BCCBf361Eb5e0aF02D2cA63a'
    const gas_limit = 400000
    const dst_eid = EndpointId.BSC_V2_MAINNET
    const taskContext = await initializeTaskContext(oAppAddress, EndpointId.APTOS_V2_MAINNET)
    await sendFromMoveVm(
        taskContext,
        BigInt(amount_ld),
        BigInt(min_amount_ld),
        to_address,
        BigInt(gas_limit),
        dst_eid,
        src_address
    )
}
export function getMoveVMContracts(lzConfig: OAppOmniGraphHardhat): OAppOmniGraphHardhat['contracts'][number][] {
    const contracts = []
    for (const entry of lzConfig.contracts) {
        const chainName = getNetworkForChainId(entry.contract.eid).chainName
        if (chainName === 'aptos' || chainName === 'initia' || chainName === 'movement') {
            contracts.push(entry as never)
        }
    }
    return contracts
}

export async function promptUserContractSelection(
    contracts: OAppOmniGraphHardhat['contracts'][number][]
): Promise<OAppOmniGraphHardhat['contracts'][number]> {
    if (contracts.length === 1) {
        return contracts[0]
    }

    const choices = contracts.map((contractEntry) => ({
        name: `${contractEntry.contract.contractName} (${EndpointId[contractEntry.contract.eid]})`,
        value: contractEntry,
    }))

    const { selectedContract } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedContract',
            message: 'Select contract:',
            choices,
        },
    ])

    return selectedContract
}

export async function initializeTaskContext(oAppAddress: string, eid: EndpointId): Promise<TaskContext> {
    const network = getNetworkForChainId(eid)
    const chainName = network.chainName
    const stage = network.env
    const accountAddress = ''
    const moveVMConnection = getConnection(chainName, stage)
    const moveVMPrivateKey = ''
    const srcEid = eid
    const oft = OFTFactory.create(moveVMConnection, oAppAddress, accountAddress, moveVMPrivateKey, srcEid)

    return {
        accountAddress: accountAddress,
        privateKey: moveVMPrivateKey,
        chain: chainName,
        stage,
        oAppAddress,
        oft,
        moveVMConnection,
        srcEid: srcEid,
        lzConfig: config,
        selectedContract: null,
        fullConfigPath: '',
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
