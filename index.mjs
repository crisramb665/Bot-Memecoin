import { 
  MYACCOUNT, 
  web3, 
  pancakeRouterContract, 
  apeRouterContract,
  ERC20Contract,
  BNBContract,
  pancakeFactoryContract,
  BSC_PANCAKE_PAIR_ABI
} from "./src/connections/connections.mjs";
import { BSC_TOKENS, BSC_TOKENS_DECIMALS } from "./src/addresses/BSC-listado-tokens.mjs";
import { POLYGON_TOKENS, POLYGON_TOKENS_DECIMALS } from "./src/addresses/Polygon-listado-tokens.mjs";
import { requiredBNBAmountInLiquidity, amountToBuy, sellingOrBuyingFee } from "./src/addresses/Values.mjs";
import { timeframes, timeframesLogs } from "./src/connections/timeframes.mjs";

//Array prices
const pricesCompra = [];
const pricesVenta = [];
let priceApeCompra = 0;
let priceApeVenta = 0;
let pricePkCompra = 0;
let pricePkVenta = 0;

let pricePkCompraBnbBusd = 0;
let pricePkVentaBnbBusd = 0;

let precioMemecoinBUSD = 0;

let startTime = 0;

let pairFromFactory = "";

let balance = 0;
let balanceBNBInPair = 0;
let balanceMEMECOINInPair = 0;
let buyingPrice = 0;
let buyTrigger = false;

async function checkBNBBUSDPair(args2) {
  const { inputTokenSymbol, inputTokenAddress, outputTokenSymbol, outputTokenAddress, inputAmount } = args2

  const priceInBnbBusd = await pancakeRouterContract.methods.getAmountsIn(inputAmount, [outputTokenAddress, inputTokenAddress]).call();
  pricePkCompraBnbBusd = web3.utils.fromWei(priceInBnbBusd[0]);

  const priceOutBnbBusd = await pancakeRouterContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
  pricePkVentaBnbBusd = web3.utils.fromWei(priceOutBnbBusd[1]);

        console.log("Precio de compra BNB/BUSD: ", pricePkCompraBnbBusd);
        console.log("Precio de venta BNB/BUSD: ", pricePkVentaBnbBusd);
}

async function checkPair(args) {
  const { inputTokenSymbol, inputTokenAddress, outputTokenSymbol, outputTokenAddress, inputAmount } = args

  //PANCAKE PRICES IN
  const priceInPk = await pancakeRouterContract.methods.getAmountsIn(inputAmount, [outputTokenAddress, inputTokenAddress]).call();
  pricePkCompra = web3.utils.fromWei(priceInPk[0]);
  pricesCompra.push({exchange:"Pancake", precio: pricePkCompra});
;

  // PANCAKE PRICES OUT
  const priceOutPk = await pancakeRouterContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
  pricePkVenta = web3.utils.fromWei(priceOutPk[1]);
  pricesVenta.push({exchange:"Pancake", precio: pricePkVenta});

  // Conversión de precios a USD (TENER EN CUENTA DECIMALES DEL MEMECOIN, CAMBIAR LOS DECIMALES AL CAMBIAR ADDRESS DEL MEMECOIN)
  const precioConDecimalesMemecoin = pricePkCompra*(10** (BSC_TOKENS_DECIMALS.WBNB - BSC_TOKENS_DECIMALS.GXPAD) );
  console.log("Precio de BNB/MEMECOIN: ", precioConDecimalesMemecoin);

  // const precioMemecoinBUSD = (Memecoin/bnb)*(bnb/busd);
  precioMemecoinBUSD = (pricePkCompraBnbBusd/precioConDecimalesMemecoin);
          
          console.log("Precio Memecoin/BUSD: ", precioMemecoinBUSD);

          // console.log("Precios compra - Amounts IN", pricesCompra);
          // console.log("Precios venta - Amounts OUT", pricesVenta);
}

let priceMonitor;
let monitoringPrice = false;
let approvalTrigger = false;

  async function monitorPrice() {
    if(monitoringPrice) {
      return
    }

    console.log("Verificando precios...")
    monitoringPrice = true

    let endTime = Date.now();
    console.log("Tiempo transcurriendo: ", endTime);

    try {

        await checkBNBBUSDPair({
          inputTokenSymbol: 'WBNB',
          inputTokenAddress: BSC_TOKENS.WBNB,
          outputTokenSymbol: 'BUSD',
          outputTokenAddress: BSC_TOKENS.BUSD,
          // inputAmount: web3.utils.toWei('1')
          inputAmount: (1 * 10**BSC_TOKENS_DECIMALS.WBNB).toString()
        })

        await pairExistence();
        //MEMECOIN-WBNB
        
        if(pairFromFactory && balanceBNBInPair > 0 && balanceMEMECOINInPair > 0) {

          await checkPair({
            inputTokenSymbol: 'WBNB',
            inputTokenAddress: BSC_TOKENS.WBNB,
            outputTokenSymbol: 'GXPAD',
            outputTokenAddress: BSC_TOKENS.GXPAD,
            // inputAmount: web3.utils.toWei('1')
            inputAmount: (1 * 10**BSC_TOKENS_DECIMALS.WBNB).toString()
          });
          
          if(balanceBNBInPair >= requiredBNBAmountInLiquidity && startTime + 2000){
            console.log("SE CUMPLEEE LA CONDICION DE LOS BNB y puedo fetchear precio de compra");
            if(!buyTrigger) {
              await buyMemecoins();
              console.log("Comprando MEMECOIN...");
              buyTrigger = true;
            }
            await getMemecoinBalance();
            if(balance > 0) {
              if(sellingOrBuyingFee > 0) {
                var balanceConvertedWithFees = sellingOrBuyingFee * (balance) * 10**(-BSC_TOKENS_DECIMALS.GXPAD);
                console.log("Saldo en MEMECOIN CONTANDO EL FEE: ", balanceConvertedWithFees);
                // IMPORTANTE: EL BUYINGPRICE DEBE SER LA DIVISIÓN ENTRE LA CANTIDAD EN USDC QUE SALIÓ DE MI WALLET
                // PARA COMPRAR EL MEMECOIN Y EL BALANCE DE DICHO TOKEN EN MI WALLET (AmountUSDC/AmountMemecoin = precio de compra) (NO DEBO CAMBIAR EL USDC DEL NUMERADOR)
                buyingPrice = (amountToBuy * 10**(-BSC_TOKENS_DECIMALS.USDC)) / balanceConvertedWithFees;

                console.log("PRECIO DE COMPRA: ", buyingPrice);
              } else {
                var balanceConverted = balance * 10**(-BSC_TOKENS_DECIMALS.GXPAD);
                console.log("Saldo en MEMECOIN: ", balanceConverted);
                // IMPORTANTE: EL BUYINGPRICE DEBE SER LA DIVISIÓN ENTRE LA CANTIDAD EN USDC QUE SALIÓ DE MI WALLET
                // PARA COMPRAR EL MEMECOIN Y EL BALANCE DE DICHO TOKEN EN MI WALLET (AmountUSDC/AmountMemecoin = precio de compra) (NO DEBO CAMBIAR EL USDC DEL NUMERADOR)
                buyingPrice = (amountToBuy * 10**(-BSC_TOKENS_DECIMALS.USDC)) / balanceConverted;

                console.log("PRECIO DE COMPRA: ", buyingPrice);
              }
            } else {
              console.log("NO hay balance del Memecoin que fetchear!");
            }
          }
        } else {
          console.log("No haga NADAAAAAA, no existe el par aún.")
        }
        
        if(!approvalTrigger) {
          await tokenApprove();
          approvalTrigger = true;
          // return
        }

        let timeFrame = endTime - startTime;
        
        if(balance > 0 && pairFromFactory) { 
          if (timeFrame < timeframes.first) { // 15 segundos
            console.log(`Dentro del primer margen de tiempo (${timeframesLogs.first}): `, timeFrame);
            if (precioMemecoinBUSD > buyingPrice * 2) {
              console.log("Se ganó el 100%, vendiendo...");
              await sellMemecoin();
              pricesCompra.length = 0;
              pricesVenta.length = 0;
            } else if (precioMemecoinBUSD < buyingPrice * 0.95) {
                console.log("1. Se perdió el 5%, vendiendo...");
                await sellMemecoin();
                pricesCompra.length = 0;
                pricesVenta.length = 0;
            } else {
                console.log("NO SE HA GANADO NADA DENTRO DEL PRIMER MARGEN");
            }
          } else if (timeFrame < timeframes.second) { // 30 segundos
              console.log(`Dentro del segundo margen de tiempo (${timeframesLogs.second}): `, timeFrame);
            if (precioMemecoinBUSD > buyingPrice * 1.75) {
              console.log("Se ganó el 75%, vendiendo...");
              await sellMemecoin();
              pricesCompra.length = 0;
              pricesVenta.length = 0;
            } else if (precioMemecoinBUSD < buyingPrice * 0.95) {
                console.log("2. Se perdió el 5%, vendiendo...");
                await sellMemecoin();
                pricesCompra.length = 0;
                pricesVenta.length = 0;
          } else {
              console.log("NO SE HA GANADO NADA DENTRO DEL SEGUNDO MARGEN");
            }
          } else if (timeFrame < timeframes.third) { // 1 minuto
              console.log(`Dentro del tercer margen de tiempo (${timeframesLogs.third}): `, timeFrame);
            if (precioMemecoinBUSD > buyingPrice * 1.5) {
              console.log("Se ganó el 50%, vendiendo");
              await sellMemecoin();
              pricesCompra.length = 0;
              pricesVenta.length = 0;
            } else if (precioMemecoinBUSD < buyingPrice * 0.95) {
                console.log("3. Se perdió el 5%, vendiendo...");
                await sellMemecoin();
                pricesCompra.length = 0;
                pricesVenta.length = 0;
          } else {
              console.log("NO SE HA GANADO NADA DENTRO DEL TERCER MARGEN");
            }
          } else if (timeFrame < timeframes.fourth) { // 2 minutos
              console.log(`Dentro del cuarto margen de tiempo (${timeframesLogs.fourth}): `, timeFrame);
            if (precioMemecoinBUSD > buyingPrice * 1.25) {
              console.log("Se ganó el 25%, vendiendo");
              await sellMemecoin();
              pricesCompra.length = 0;
              pricesVenta.length = 0;
            } else if (precioMemecoinBUSD < buyingPrice * 0.95) {
                console.log("4. Se perdió el 5%, vendiendo...");
                await sellMemecoin();
                pricesCompra.length = 0;
                pricesVenta.length = 0;
            } else {
                console.log("NO SE HA GANADO NADA DENTRO DEL CUARTO MARGEN");
            }
           } else if (timeFrame > timeframes.fourth) { // Más allá de los 2 minutos
              console.log(`Mas alla del cuarto margen de tiempo (${timeframesLogs.fourth}): `, timeFrame);
            if (precioMemecoinBUSD > buyingPrice * 1.1) {
              console.log("Se ganó el 10% o tal vez más, vendiendo");
              await sellMemecoin();
              pricesCompra.length = 0;
              pricesVenta.length = 0;
            } else if (precioMemecoinBUSD < buyingPrice* 0.95) {
                console.log("5. Se perdió el 5%, vendiendo...");
                await sellMemecoin();
                pricesCompra.length = 0;
                pricesVenta.length = 0;
            } else {
                console.log("NO SE HA GANADO NADA DENTRO DEL QUINTO MARGEN");
            }
          }
        } else {
          console.log("No haga nadaaaaa X2, no existe el par aun");
        }
    
        console.log("---------------------------------------------------------------------------------------");

    } catch (error) {
        console.error(error)
        monitoringPrice = false
        clearInterval(priceMonitor)
        return
    }
    monitoringPrice = false
  }

async function pairExistence() {
  const addr1 = BSC_TOKENS.GXPAD;
  const addr2 = BSC_TOKENS.WBNB;

  // ESTE FRAGMENTO DE CÓDIGO ES FUNCIONAL, PERO ME GUSTA MÁS MI MÉTODO PROPIO 
  // pairFromFactory = await pancakeFactoryContract.methods.getPair(addr1, addr2)
  // .call(function(err, pairAddress) {
  //   console.log("Pair Address GXPAD/WBNB: ", pairAddress);

  //   if(pairAddress) {
  //     var pair = new web3.eth.Contract(BSC_PANCAKE_PAIR_ABI, pairAddress);
  //     pair.methods.getReserves().call(function(err, reserves) {
  //       console.log("Pair Reserves: ", reserves);
  //     });
  //   }
  // }); 
  // ESTE FRAGMENTO DE CÓDIGO ES FUNCIONAL, PERO ME GUSTA MÁS MI MÉTODO PROPIO 

  pairFromFactory = await pancakeFactoryContract.methods.getPair(addr1, addr2).call();

  console.log(`Es un string :D. MEMECOIN/WBNB LP : `, pairFromFactory);

  await getMemecoinBalanceInPair(pairFromFactory);
  await getBNBBalanceInPair(pairFromFactory);

  console.log("Reservas de BNB en el par GXPAD/WBNB: ", balanceBNBInPair);
  console.log("Reservas de MEMECOIN en el par GXPAD/WBNB: ", balanceMEMECOINInPair);

  if(!pairFromFactory) {
    return console.log("Aún no hay par creado. Se debe seguir esperando");
  }
}

async function buyMemecoins() {
  const amountIn = amountToBuy.toString();
  const amountOutMin = "1"; // Desde aquí se puede configurar el slippage
  const addr1 = BSC_TOKENS.USDC; //USDC token de entrada
  const addr2 = BSC_TOKENS.WBNB
  const addr3 = BSC_TOKENS.GXPAD; //MEMECOIN token de salida
  const path = [addr1, addr2, addr3];
  const to = MYACCOUNT; //Dirección a donde se van a mandar los tokens
  const deadline = 1735291535; //Tiempo limite de expiracion en unix // Viernes 27/12/2024

  await pancakeRouterContract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, to, deadline)
  .send({ from : MYACCOUNT }); // PARA TOKENS QUE COBRAN FEES AL COMPRARLOS

  // await pancakeRouterContract.methods.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)
  // .send({ from : MYACCOUNT }); // PARA TOKENS QUE NO COBRAN FEES AL COMPRARLOS
}

async function getMemecoinBalance() {
  balance = await ERC20Contract.methods.balanceOf(MYACCOUNT).call();
}

async function getMemecoinBalanceInPair(pairAddress) {
  const pairAddr = pairAddress;

  balanceMEMECOINInPair = await ERC20Contract.methods.balanceOf(pairAddr).call();
}

async function getBNBBalanceInPair(pairAddress) {
  const pairAddr = pairAddress;
  
  balanceBNBInPair = await BNBContract.methods.balanceOf(pairAddr).call();
}

// ESTE MÉTODO DE APPROVE SÓLO APLICA PARA ERC20 (sólo es necesario ERC20)
async function tokenApprove() {
  const spender = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // Pancake Router Address
  const amount = "1157920892373161954235709850086879078532699846656405640394575840079131296399"; // Numero exagerado como siempre

  await ERC20Contract.methods.approve(spender, amount)
  .send({ from: MYACCOUNT });
}

async function sellMemecoin() {
  const amountIn = balance.toString();
  const amountOutMin = "1"; // Desde aquí se puede configurar el slippage
  const addr1 = BSC_TOKENS.GXPAD; //DAI token de entrada (DECIMALS: 6)
  const addr2 = BSC_TOKENS.WBNB; //WBNB token de salida (DEBE SER SI O SI WBNB O EL TOKEN PRINCIPAL DE LA RED)
  const path = [addr1, addr2];
  const to = MYACCOUNT; //Dirección a donde se van a mandar los tokens
  const deadline = 1735291535; //Tiempo limite de expiracion en unix // Viernes 27/12/2024

  await pancakeRouterContract.methods.swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)
  .send({ from: MYACCOUNT });

  // console.log(amountIn);
}

async function sellMemecoin1() {
  const amountIn = balance.toString();
  const amountOutMin = "1"; // Desde aquí se puede configurar el slippage
  const addr1 = BSC_TOKENS.GXPAD; //MEMECOIN token de entrada
  const addr2 = BSC_TOKENS.WBNB
  const addr3 = BSC_TOKENS.USDC; //USDC token de salida
  const path = [addr1, addr2, addr3];
  const to = MYACCOUNT; //Dirección a donde se van a mandar los tokens
  const deadline = 1735291535; //Tiempo limite de expiracion en unix // Viernes 27/12/2024

  await pancakeRouterContract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, to, deadline)
  .send({ from : MYACCOUNT }); // PARA TOKENS QUE COBRAN FEES AL COMPRARLOS

  // await pancakeRouterContract.methods.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)
  // .send({ from : MYACCOUNT }); // PARA TOKENS QUE NO COBRAN FEES AL COMPRARLOS
}

async function medicionTiempo(fn) {
  startTime = Date.now();
  fn();
  var end = Date.now();
  console.log("Test De medición INICIAL: " + (startTime) + " ms");
}

medicionTiempo(monitorPrice);

// Check markets every n seconds
const POLLING_INTERVAL = process.env.POLLING_INTERVAL || 90000 // 60 seconds
priceMonitor = setInterval(async () => { await monitorPrice() }, POLLING_INTERVAL);

// approvalTrigger = setTimeout(async () => { await tokenApprove() }, [] );
