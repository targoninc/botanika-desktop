import {chromium} from 'playwright';
import {ModelDefinition} from "../src/models/llms/ModelDefinition";
import {ModelCapability} from "../src/models/llms/ModelCapability";
import fs from "fs";

function getCapabilities(params: string[]) {
    let caps: ModelCapability[] = [ModelCapability.streaming];

    if (params.includes("tools")) {
        caps.push(ModelCapability.tools);
    }

    if (params.includes("vision")) {
        caps.push(ModelCapability.fileInput);
    }

    return caps;
}

async function scrapeOllamaModels() {
    // Launch browser
    const browser = await chromium.launch({
        headless: true // Set to false if you want to see the browser
    });

    try {
        // Create a new page
        const page = await browser.newPage();

        // Navigate to Ollama search page
        await page.goto('https://ollama.com/search');

        // Wait for elements with x-test-model attribute to be available
        await page.waitForSelector('[x-test-model]');

        // Get all elements with x-test-model attribute
        let models = await page.$$eval('[x-test-model]', (elements) => {
            return elements.map(el => {
                const text = el.textContent.replaceAll(/\s+/g, " ").trim();
                const caps = [...el.querySelectorAll('[x-test-capability]')].map((el) => el.textContent);
                const id = text.split(" ")[0];

                if (caps.includes("embedding")) {
                    return null;
                }

                // @ts-ignore
                return <ModelDefinition>{
                    id,
                    displayName: id,
                    capabilities: caps,
                }
            });
        });
        models = models.filter(m => !!m);
        models.forEach(m => {
            // @ts-ignore
            m.capabilities = getCapabilities(m.capabilities);
        })
        fs.writeFileSync("models.json", JSON.stringify(models, null, 2));
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Always close the browser
        await browser.close();
    }
}

// Run the scraper
scrapeOllamaModels().catch(console.error);