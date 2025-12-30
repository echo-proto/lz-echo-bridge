// import { hexAddrToAptosBytesAddr } from '@layerzerolabs/devtools-move'
import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

// console.log(hexAddrToAptosBytesAddr('0x8dac4489ebed5b6bb43c88a7fd36dc5caa89c64e7e7a2581ae5f9aec2738bc13'))

enum MsgType {
    SEND = 1,
    SEND_AND_CALL = 2,
}

const bscContract: OmniPointHardhat = {
    eid: EndpointId.BSC_V2_MAINNET,
    contractName: 'EchoOFT',
}

const aptosContract: OmniPointHardhat = {
    eid: EndpointId.APTOS_V2_MAINNET,
    contractName: 'EchoOFT',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: bscContract,
            config: {
                owner: '0xBc6F1FDf19618Bc6BCCBf361Eb5e0aF02D2cA63a',
                delegate: '0xBc6F1FDf19618Bc6BCCBf361Eb5e0aF02D2cA63a',
            },
        },
        {
            contract: aptosContract,
            config: {
                delegate: '0x8dac4489ebed5b6bb43c88a7fd36dc5caa89c64e7e7a2581ae5f9aec2738bc13',
                owner: '0x8dac4489ebed5b6bb43c88a7fd36dc5caa89c64e7e7a2581ae5f9aec2738bc13',
            },
        },
    ],
    connections: [
        {
            from: aptosContract,
            to: bscContract,
            config: {
                enforcedOptions: [
                    {
                        msgType: MsgType.SEND,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 80_000, // gas limit in wei for EndpointV2.lzReceive
                        value: 0, // msg.value in wei for EndpointV2.lzReceive
                    },
                    {
                        msgType: MsgType.SEND_AND_CALL,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 80_000, // gas limit in wei for EndpointV2.lzReceive
                        value: 0, // msg.value in wei for EndpointV2.lzReceive
                    },
                ],
                sendLibrary: '0xc33752e0220faf79e45385dd73fb28d681dcd9f1569a1480725507c1f3c3aba9',
                receiveLibraryConfig: {
                    // Required Receive Library Address on Aptos
                    receiveLibrary: '0xc33752e0220faf79e45385dd73fb28d681dcd9f1569a1480725507c1f3c3aba9',
                    // Optional Grace Period for Switching Receive Library Address on Aptos
                    gracePeriod: BigInt(0),
                },
                // Optional Receive Library Timeout for when the Old Receive Library Address will no longer be valid on Aptos
                // receiveLibraryTimeoutConfig: {
                //     lib: '0xbe533727aebe97132ec0a606d99e0ce137dbdf06286eb07d9e0f7154df1f3f10',
                //     expiry: BigInt(1000000000),
                // },
                sendConfig: {
                    executorConfig: {
                        maxMessageSize: 10_000,
                        // The configured Executor address on Aptos
                        executor: '0x15a5bbf1eb7998a22c9f23810d424abe40bd59ddd8e6ab7e59529853ebed41c4',
                    },
                    ulnConfig: {
                        // The number of block confirmations to wait on Aptos before emitting the message from the source chain.
                        confirmations: BigInt(12),
                        // The address of the DVNs you will pay to verify a sent message on the source chain.
                        // The destination tx will wait until ALL `requiredDVNs` verify the message.
                        requiredDVNs: [
                            '0x07ad47ea4f858e7189d2c6e7327f166993e8f884386db9564d732bcff63fe4ff',
                            '0xf3f0a412626edba5ddd3613d91109b241893873ac5479ade231cf0b3130572b5',
                        ],
                        // The address of the DVNs you will pay to verify a sent message on the source chain.
                        // The destination tx will wait until the configured threshold of `optionalDVNs` verify a message.
                        optionalDVNs: [],
                        // The number of `optionalDVNs` that need to successfully verify the message for it to be considered Verified.
                        optionalDVNThreshold: 0,
                    },
                },
                // Optional Receive Configuration
                // @dev Controls how the `from` chain receives messages from the `to` chain.
                receiveConfig: {
                    ulnConfig: {
                        // The number of block confirmations to expect from the `to` chain.
                        confirmations: BigInt(12),
                        // The address of the DVNs your `receiveConfig` expects to receive verifications from on the `from` chain.
                        // The `from` chain's OApp will wait until the configured threshold of `requiredDVNs` verify the message.
                        requiredDVNs: [
                            '0x07ad47ea4f858e7189d2c6e7327f166993e8f884386db9564d732bcff63fe4ff',
                            '0xf3f0a412626edba5ddd3613d91109b241893873ac5479ade231cf0b3130572b5',
                        ],
                        // The address of the `optionalDVNs` you expect to receive verifications from on the `from` chain.
                        // The destination tx will wait until the configured threshold of `optionalDVNs` verify the message.
                        optionalDVNs: [],
                        // The number of `optionalDVNs` that need to successfully verify the message for it to be considered Verified.
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
        {
            from: bscContract,
            to: aptosContract,
            config: {
                enforcedOptions: [
                    {
                        msgType: MsgType.SEND,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 5_000, // gas limit in wei for EndpointV2.lzReceive
                        value: 0, // msg.value in wei for EndpointV2.lzReceive
                    },
                    {
                        msgType: MsgType.SEND_AND_CALL,
                        optionType: ExecutorOptionType.LZ_RECEIVE,
                        gas: 5_000, // gas limit in wei for EndpointV2.lzCompose
                        value: 0, // msg.value in wei for EndpointV2.lzCompose
                    },
                ],
                sendLibrary: '0x9F8C645f2D0b2159767Bd6E0839DE4BE49e823DE', // senduln302
                receiveLibraryConfig: {
                    receiveLibrary: '0xB217266c3A98C8B2709Ee26836C98cf12f6cCEC1', // receiveuln302
                    gracePeriod: BigInt(0),
                },
                // receiveLibraryTimeoutConfig: {
                //     lib: '0x188d4bbCeD671A7aA2b5055937F79510A32e9683',
                //     expiry: BigInt(67323472),
                // },
                sendConfig: {
                    executorConfig: {
                        maxMessageSize: 10_000,
                        executor: '0x3ebD570ed38B1b3b4BC886999fcF507e9D584859', // lz executor
                    },
                    ulnConfig: {
                        confirmations: BigInt(12),
                        requiredDVNs: [
                            '0x31f748a368a893bdb5abb67ec95f232507601a73',
                            '0xfd6865c841c2d64565562fcc7e05e619a30615f0',
                        ],
                        optionalDVNThreshold: 0,
                    },
                },
                receiveConfig: {
                    ulnConfig: {
                        confirmations: BigInt(12),
                        requiredDVNs: [
                            '0x31f748a368a893bdb5abb67ec95f232507601a73',
                            '0xfd6865c841c2d64565562fcc7e05e619a30615f0',
                        ],
                        optionalDVNThreshold: 0,
                    },
                },
            },
        },
    ],
}

export default config
