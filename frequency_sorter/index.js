const fs = require("fs").promises;
const _ = require("lodash");

const loadingAnimation = ["|", "/", "-", "\\"];
let animationIndex = 0;

(async () => {
  try {
    console.log("Loading scraped words...");
    const scrapedWords = (await fs.readFile("./scraped_words/kanji_words.txt", "utf-8")).split("\n");

    console.log("Loading Yomichan dictionaries...");
    const yomichanDictionaries = [
      require("./yomichan_dicts/jpdb.json"),
      // require("./yomichan_dicts/vn_v2.json"),
      // require("./yomichan_dicts/bccwj.json"),
      // require("./yomichan_dicts/wikipedia.json"),
      // require("./yomichan_dicts/anime-jdrama.json"),
      // require("./yomichan_dicts/novels.json"),
      // Add more dictionary paths as needed
    ];

    const messages = [];
    const processedWords = new Set();

    console.log("Processing scraped words...");
    for (const scrapedWord of scrapedWords) {
      if (!processedWords.has(scrapedWord)) {
        process.stdout.write(`\r${loadingAnimation[animationIndex]} Processing word: ${scrapedWord}`);
        animationIndex = (animationIndex + 1) % loadingAnimation.length;

        const matchingEntry = yomichanDictionaries.map((dictionary) => dictionary.find((entry) => entry[0] === scrapedWord)).find(Boolean);

        const frequency = matchingEntry ? matchingEntry[2]?.frequency : null;
        const value = frequency ? frequency.value : "N/A";

        messages.push({ word: scrapedWord, value });
        processedWords.add(scrapedWord);
      }
    }

    const sortedMessages = messages.sort((a, b) => {
      if (a.value === "N/A") return 1;
      if (b.value === "N/A") return -1;
      return a.value - b.value;
    });

    const formattedConsoleMessages = sortedMessages.map(({ word, value }) => `'${word}': "${value}"`);

    //console.log("\nWriting formatted console messages to 'formatted_console_output.txt'...");
    await fs.writeFile("./output/formatted_console_output.txt", formattedConsoleMessages.join("\n"), { encoding: "utf-8" });

    console.log("Formatted console messages have been written to 'formatted_console_output.txt'.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();