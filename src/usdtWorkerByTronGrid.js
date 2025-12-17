require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { db, getLastBlock, saveLastBlock, insertEvent } = require('./db');

const CONTRACT_USDT = process.env.CONTRACT_ADDRESS;
const POLL_MS = Number(process.env.POLL_INTERVAL_MS || 3000);
const BASE = process.env.TRONGRID_BASE || 'https://api.trongrid.io';
const API_KEY = process.env.TRONGRID_API_KEY || '';

const axiosInstance = axios.create({
    baseURL: BASE,
    timeout: 15000,
    headers: API_KEY ? { 'TRON-PRO-API-KEY': API_KEY } : {}
});

// log file setup
const LOG_FILE = path.join(__dirname, '..', 'events.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(msg) {
    const str = `[${new Date().toISOString()}] ${msg}`;
    console.log(str);
    logStream.write(str + '\n');
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

const START_BLOCK = 78292201;

async function pollLoop() {

    let last = await getLastBlock();

    if (last) {
        currentBlock = last + 1;
        console.log(`📌 Last processed block in DB: ${last} → starting from ${currentBlock}`);
    } else {
        currentBlock = START_BLOCK;
        console.log(`📌 No DB record → starting from hardcoded block ${currentBlock}`);
    }

    while (true) {
        if (global.CUSTOM_START_BLOCK !== undefined) {
            currentBlock = global.CUSTOM_START_BLOCK;
            delete global.CUSTOM_START_BLOCK;
            log(`🔄 Custom start block set → starting from block ${currentBlock}`);
        }
        try {
            let fingerprint = "";
            let moreData = true;

            while (moreData) {
                const res = await axiosInstance.get(`/v1/contracts/${CONTRACT_USDT}/events`, {
                    params: {
                        block_number: currentBlock,
                        limit: 200,
                        fingerprint: fingerprint,
                        only_confirmed: true
                    }
                });


                const events = res.data?.data || [];
                const nextFp = res.data?.meta?.fingerprint;


                log(`Block ${currentBlock} | fingerprint="${nextFp}" | events=${events.length}`);

                for (const ev of events) {
                    // console.log(JSON.stringify(ev, null, 2));
                    await insertEvent(ev);
                    // log(`Saved Event → tx=${ev.transaction_id}`);
                }


                if (nextFp && typeof nextFp === "string" && nextFp.length > 0) {
                    fingerprint = nextFp;
                    moreData = true;
                } else {
                    moreData = false;
                }
            }

            await saveLastBlock(currentBlock);
            log(`✔ Block ${currentBlock} finished & saved to DB`);

            currentBlock++;

            await sleep(POLL_MS);

        } catch (err) {
            log(`❌ Error: ${err.message}`);
            await sleep(POLL_MS);
        }
    }
}

module.exports = { pollLoop };
