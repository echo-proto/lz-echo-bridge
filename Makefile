# Conditionally include .env file if not running in CI/CD environment
ifndef GITHUB_ACTIONS
  -include .env
endif

# default env values
APTOS_NETWORK ?= local
ARTIFACTS_LEVEL ?= all
DEFAULT_FUND_AMOUNT ?= 100000000
DEFAULT_FUNDER_PRIVATE_KEY ?= 0x0
PYTH_HERMES_URL ?= https://hermes-beta.pyth.network
PYTH_CONTRACT_ACCOUNT ?= 0x0
PYTH_DEPLOYER_ACCOUNT ?= 0x0
PYTH_WORMHOLE ?= 0x0
CHAINLINK_DATA_FEEDS ?= 0x0
CHAINLINK_PLATFORM ?= 0x0

PROFILES := oft

LZ_PROFILES := oft_common=$(OFT_COMMON),router_node_0=$(ROUTER_NODE_0),simple_msglib=$(SIMPLE_MSGLIB),blocked_msglib=$(BLOCKED_MSGLIB),uln_302=$(ULN_302),router_node_1=$(ROUTER_NODE_1),endpoint_v2_common=$(ENDPOINT_V2_COMMON),endpoint_v2=$(ENDPOINT_V2),layerzero_admin=$(LAYERZERO_ADMIN),layerzero_treasury_admin=$(LAYERZERO_TREASURY_ADMIN),msglib_types=$(MSGLIB_TYPES),treasury=$(TREASURY),worker_peripherals=$(WORKER_PERIPHERALS),price_feed_router_0=$(PRICE_FEED_ROUTER_0),price_feed_router_1=$(PRICE_FEED_ROUTER_1),price_feed_module_0=$(PRICE_FEED_MODULE_0),worker_common=$(WORKER_COMMON),executor_fee_lib_router_0=$(EXECUTOR_FEE_LIB_ROUTER_0),executor_fee_lib_router_1=$(EXECUTOR_FEE_LIB_ROUTER_1),dvn_fee_lib_router_0=$(DVN_FEE_LIB_ROUTER_0),dvn_fee_lib_router_1=$(DVN_FEE_LIB_ROUTER_1),executor_fee_lib_0=$(EXECUTOR_FEE_LIB_0),dvn_fee_lib_0=$(DVN_FEE_LIB_0),dvn=$(DVN)

define APTOS_NAMED_ADDRESSES
$(foreach profile,$(PROFILES),$(profile)=$(profile),)oft_admin=oft,$(LZ_PROFILES)
endef

init-profiles:
	@for profile in $(PROFILES); do \
		echo | aptos init --profile $$profile --network $(APTOS_NETWORK) --assume-yes --skip-faucet; \
	done
	
publish-oft:
	aptos move publish --assume-yes \
	--included-artifacts $(ARTIFACTS_LEVEL) \
	--sender-account oft \
	--profile oft \
	--named-addresses "${APTOS_NAMED_ADDRESSES}"