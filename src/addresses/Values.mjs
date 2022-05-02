import { 
    web3, 
    ERC20Contract, 
    MYACCOUNT 
} from "../../src/connections/connections.mjs";
import { BSC_TOKENS_DECIMALS } from "./BSC-listado-tokens.mjs";
// import { balance } from "../../index.mjs";

// 6 dígitos: 000000
// 18 dígitos: 000000000000000000

// (Memecoin/bnb)*(bnb/busd);

// const fix = 0;

// NOTA: TENER CUIDADO CON LOS DECIMALES
// SÓLO SE PUEDEN PASAR ENTEROS A toFixed()
// SI EL expectedValueNumber es un decimal, NOOOO SE PUEDE OPERAR CON EL TOKEN  
// const expectedValueNumber = 0.00000514 * (10**BSC_TOKENS_DECIMALS.MEDUSA); // CURRENT: MEDUSA
// const expectedValueNumberToString = expectedValueNumber.toFixed(fix);
// export const expectedValue = web3.utils.toBN(expectedValueNumberToString);
// export const expectedValueToGain100Percent = web3.utils.toBN((expectedValueNumber * 2).toFixed(fix));
// export const expectedValueToGain75Percent = web3.utils.toBN((expectedValueNumber * 1.75).toFixed(fix));
// export const expectedValueToGain50Percent = web3.utils.toBN((expectedValueNumber * 1.5).toFixed(fix));
// export const expectedValueToGain25Percent = web3.utils.toBN((expectedValueNumber * 1.25).toFixed(fix));
// export const expectedValueToGain10Percent = web3.utils.toBN((expectedValueNumber * 1.1).toFixed(fix));
// export const expectedValueToLose5Percent = web3.utils.toBN((expectedValueNumber * 0.95).toFixed(fix));

// console.log("Valor esperado para testear decimales: ", expectedValueNumberToString, expectedValueToGain75Percent
//     // expectedValueToGain75Percent,expectedValueToGain25Percent,expectedValueToGain10Percent
//     );

export const requiredBNBAmountInLiquidity = 12 * 10**(BSC_TOKENS_DECIMALS.WBNB);
export const amountToBuy = 25 * 10**(BSC_TOKENS_DECIMALS.USDC); // Todo en USDC

// Esto es por si cobran un fee para vender o comprar el Memecoin (este valor debe ser por ejemplo: 1.15, 1.2, etc...)
// Es decir, debe ser SIEMPRE mayor a 1 para que no reste el balance
export const sellingOrBuyingFee = 1.1; 

// const myMemecoinBalanceOf = balance;
// .call().then();

// const balanceOfToken = myMemecoinBalanceOf[1];
// console.log("Saldo de USDC DESDE values.mjs: ", myMemecoinBalanceOf);

// const amountOfTokensToSell = 11.44;
// export const amountOfTokensToSellWithDecimals = (amountOfTokensToSell * (10**BSC_TOKENS_DECIMALS.MEDUSA)).toString();

// export const testAmount = BigNumber.from(amountOfTokensToSell).mul(BigNumber.from(10).pow(BSC_TOKENS_DECIMALS.YAMATO));
// console.log(testAmount);
