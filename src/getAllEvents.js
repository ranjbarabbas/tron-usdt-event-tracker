const TronWeb = require('tronweb').TronWeb;

// Connect to free TronGrid public full node
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io'
});

const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

let lastProcessedBlock = 0; // store last block processed

const sleep = ms => new Promise(res => setTimeout(res, ms));


// Fetch latest block number
async function getLatestBlockNumber() {
    const block = await tronWeb.trx.getCurrentBlock();
    return block.block_header.raw_data.number;
}

// Fetch USDT Transfer events for a specific block
async function getUsdtEventsByBlock(blockNumber) {
    try {
        const res = await tronWeb.getEventResult(USDT_CONTRACT, {
            eventName: 'Transfer',
            onlyConfirmed: true,
            blockNumber: blockNumber
        });

        const events = Array.isArray(res?.data) ? res.data : [];

        for (const e of events) {
            if (e === events[0]) {
            console.log({
                from: tronWeb.address.fromHex(e.result.from),
                to: tronWeb.address.fromHex(e.result.to),
                value: e.result.value / 1e6, // USDT has 6 decimals
                txID: e.transaction_id,
                block: e.block_number
            });            }

        }
    } catch (err) {
        console.error('Error fetching events:', err.code);
        await sleep(5000);
        await getUsdtEventsByBlock(blockNumber);; // retry on error
        console.log('Retrying block:', blockNumber);
    }
}


// Main polling loop
async function startPolling() {
    while (true) {
        try {
            const latestBlock = await getLatestBlockNumber();
            console.log('Latest Block:', latestBlock);

            if (latestBlock > lastProcessedBlock) {
                // Process all new blocks
                for (let bn = lastProcessedBlock + 1; bn <= latestBlock; bn++) {
                    console.log(`Processing block ${bn}...`);
                    await getUsdtEventsByBlock(bn);
                    await sleep(1000); // brief pause between blocks
                }
                lastProcessedBlock = latestBlock;
            }

            // Wait before next poll
            await new Promise(res => setTimeout(res, 3000)); // 3 seconds
        } catch (err) {
            console.error('Polling error:', err);
            await new Promise(res => setTimeout(res, 5000)); // retry delay
        }
    }
}

// Start from latest block
(async () => {
    lastProcessedBlock = await getLatestBlockNumber();
    console.log('Starting from block:', lastProcessedBlock);
    startPolling();
})();
