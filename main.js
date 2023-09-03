const puppeteer = require('puppeteer');
const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.clear();

async function onStart() {
    let userKanji;
    console.log("**************")
    rl.question('Enter a Kanji:\n**************\n', (input) => {
        checkInput = input;

        const isJP = checkInput.match(/[\u4e00-\u9faf\u3400-\u4dbf]/);

        if ((checkInput.length) === 1 && isJP) {
            userKanji = input;
            rl.question('\nEnter # of pages: ', (pages) => {
                const maxPages = Number(pages);

                if (maxPages > 0 && !isNaN(maxPages)) {
                    searchJisho(userKanji, maxPages);
                } else {
                    console.log("Invalid Number!")
                    process.close();
                }
            })
        } else if (checkInput.length > 1 && isJP) {
            // console.clear()
            console.log('Only enter a single kanji!\n');
            onStart();
        } else {
            // console.clear()
            console.log('Only enter kanji!\n');
            onStart();
        }
    })


}

async function searchJisho(userKanji, maxPages) {
    rl.close();
    const browser = await puppeteer.launch({
        headless: 'new'
    });
    const page = await browser.newPage();

    //add * to kanji
    searchLink = "https://jisho.org/search/" + "*" + userKanji + "*";

    console.clear();
    console.log("Loading...")

    await page.goto(searchLink)

    let pageCounter = 1;
    await grabWords(page, searchLink, pageCounter, maxPages);
}

async function grabWords(page, searchLink, pageCounter, maxPages) {
    console.clear();
    console.log("Grabbing Words...");

    const spanWords = await page.evaluate(() => {
        const textElements = document.querySelectorAll('div.concept_light-representation span.text');
        return Array.from(textElements, (element) => {
            return element.textContent.trim();
        });
    });

    //append words to file
    const newData = spanWords.join("\n");
    fs.appendFile('./frequency_sorter/scraped_words/kanji_words.txt', newData, (err) => {
        if (err) {
            console.clear();
            console.log("File Error!");
            process.exit();
        } else {
            console.clear();
            console.log(`Appended page ${pageCounter} of ${maxPages}`);
        }
    });

    pageCounter++;

    if (pageCounter <= maxPages) { // Check if we should proceed to the next page
        await nextPage(page, searchLink, pageCounter, maxPages);
    } else {
        console.log("***Finished!***");
        process.exit(); // Exit the script when finished
    }
}

async function nextPage(page, searchLink, pageCounter, maxPages) {
    // Update the search link
    newSearchLink = searchLink + `%20%23words?page=${pageCounter}`;
    await page.goto(newSearchLink);

    await grabWords(page, searchLink, pageCounter, maxPages); // Pass the correct arguments
}


onStart();
