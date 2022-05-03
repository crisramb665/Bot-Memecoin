# Bot-Memecoin

Created by Cristian 

INITIAL CONDITIONS

ENTER YOUR WALLET ADDRESS AND ITS PRIVATE KEYS IN .env FIRST!

1. Check if selected token is already tradeable (No scams)
2. Add selected token to trade with its decimals at listado-tokens.mjs
3. Set required liq for BNB at Values.mjs (suggested: 100 BNB or more)
4. Set amount of tokens to buy at Values.mjs (in USDC)
5. Set sellingOrBuyingFee in case that exists at Values.mjs
6. Set ERC20 token address in the contract instance at connections.mjs (ERC20Contract)
7. Set or fix timeframes at timeframes.mjs
8. Check Pair Existence setting pairs at index.mjs (line 239)
9. Set tokens on checkPairs for price monitoring AND THEIR DECIMALS at index.mjs (outputTokenAddress) (Seize and change all the words alluding to the Memecoin to works with at index.mjs (several lines))
10. Check if tokenApprove(), buyMemecoin() and sellMemecoin() functions were activated on MonitoringPrice() at index.mjs
11. After token buying, don't forget to comment buyMemecoin() function in case bot restart.
