import { createRequire } from "module";
import { 
    BSCExchangeAddresses, 
    PolygonExchangeAddresses,
    BSCFactoryAddresses 
} from "../addresses/Routers.mjs";
import { BSC_TOKENS } from "../addresses/BSC-listado-tokens.mjs";

const require = createRequire(import.meta.url);

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const moment = require('moment-timezone')
const numeral = require('numeral')
const _ = require('lodash')
const axios = require('axios')

// SERVER CONFIG
const PORT = process.env.PORT
const app = express();
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`))

// WEB3 CONFIG
// const web3 = new Web3(process.env.RPC_URL) <= Anterior
export const web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL));
export const MYACCOUNT = process.env.ACCOUNT; //NUEVO

const BSC_PANCAKE_ROUTER_ABI = require("../abi/pancakeRouterABI.json");
const POLYGON_APE_ROUTER_ABI = require("../abi/apeRouterABI.json");
const ERC20_ABI = require("../abi/ERC20ABI.json"); // SÓLO PARA ERC20
const BSC_PANCAKE_FACTORY_ABI = require("../abi/pancakeFactoryABI.json");

export const pancakeRouterContract = new web3.eth.Contract(
    BSC_PANCAKE_ROUTER_ABI, 
    BSCExchangeAddresses.PANCAKE_ROUTER_ADDRESS
);

export const apeRouterContract = new web3.eth.Contract(
    POLYGON_APE_ROUTER_ABI, 
    PolygonExchangeAddresses.APE_ROUTER_ADDRESS
);

export const ERC20Contract = new web3.eth.Contract(
    ERC20_ABI,
    BSC_TOKENS.GXPAD
);

export const BNBContract = new web3.eth.Contract(
    ERC20_ABI,
    BSC_TOKENS.WBNB
);

export const pancakeFactoryContract = new web3.eth.Contract(
    BSC_PANCAKE_FACTORY_ABI,
    BSCFactoryAddresses.PANCAKE_FACTORY_ADDRESS
);

export const BSC_PANCAKE_PAIR_ABI = require("../abi/pancakePairABI.json");
