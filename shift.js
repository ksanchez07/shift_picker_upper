const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Edit date for the shift you want, enter the time from before you press enter
// on terminal because it will only add the first shift
const URL = "https://atoz.amazon.work/shifts/schedule/find?date=2026-02-09";

// Function to calculate the delay until target time today
function getDelayUntilTime(targetHour, targetMinute, targetSecond, targetMillisecond) {
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(targetHour, targetMinute, targetSecond, targetMillisecond);

    // If the target time is in the past, set it for the next day
    if (targetTime < now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime - now;
}

async function initBrowser() {
    const browser = await puppeteer.launch({ 
        headless: false, 
        slowMo: 100, // Makes interactions more human-like
        args: ['--disable-blink-features=AutomationControlled'] // Avoid detection
    });

    const page = await browser.newPage();
    await page.goto("https://atoz.amazon.work/");

    console.log("Log in manually and press Enter in terminal when done...");
    
    // Wait for user to log in manually
    await new Promise(resolve => process.stdin.once('data', resolve));

    // After login, navigate to the shifts page
    await page.goto(URL, { waitUntil: 'networkidle2' });

    //EDIT TO CHANGE TIME FRAME
    //await page.type('#Start\\ time', '05:30 AM');


    return page;
}

async function clickViewDetails(page) {
    try {
        //waiting
        console.log("Waiting for 'Add shift' button...");
        await page.waitForSelector("button[data-test-id='AddOpportunityModalButton']");
        
        //clicking add shift
        await page.click("button[data-test-id='AddOpportunityModalButton']");

        //clicking ok
        await page.waitForSelector("button[data-test-id='AddOpportunityModalSuccessDoneButton']", { visible: true });
        await page.click("button[data-test-id='AddOpportunityModalSuccessDoneButton']")

        console.log("First shift added!");
        //finished clicking first button

        //awaiting next shift
        console.log("Waiting for 'Add shift' button...");
        await page.waitForSelector("button[data-test-id='AddOpportunityModalButton']");
        
        await page.click("button[data-test-id='AddOpportunityModalButton']");
        
       
        await page.waitForSelector("button[data-test-id='AddOpportunityModalSuccessDoneButton']", { visible: true });
        await page.click("button[data-test-id='AddOpportunityModalSuccessDoneButton']")

        console.log("Second shift added!");

        //next
        console.log("Waiting for 'Add shift' button...");
        await page.waitForSelector("button[data-test-id='AddOpportunityModalButton']");
        
        //clicking add shift
        await page.click("button[data-test-id='AddOpportunityModalButton']");

        //clicking ok
        await page.waitForSelector("button[data-test-id='AddOpportunityModalSuccessDoneButton']", { visible: true });
        await page.click("button[data-test-id='AddOpportunityModalSuccessDoneButton']")

        console.log("Third shift added!");

    } catch (error) {
        console.error("Failed to find the 'Add shift' button!", error);
    }
}

async function start() {
    const page = await initBrowser();

    // Calculate the delay until 12:50:59 PM today
    const delay = getDelayUntilTime(12, 19, 59, 500);


    console.log(`Waiting until 12:19:59 PM... (${delay / 1000} seconds)`);

    // Wait until 12:50:59 PM
    setTimeout(async () => {

        page.goto(URL, { waitUntil: 'networkidle2' });
       
        await clickViewDetails(page);
    }, delay);
}

start();
