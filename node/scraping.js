import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

export default Webscraper;

// path til filen hvor scrapet data vil blive gemt
const filePath = 'database/courseDetails.txt';

// async tillader brugen af await funktionen,
// hvormed vi kan afvente til en handling er udført med at fortsætte funktionen
async function Webscraper(url, forceUpdate = false) {
  let existingData = {};
  let ectsReturn = null
  try {
    const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
    fileContent.split('\n').forEach(line => {
      const [url, title, ects] = line.split(', ');
      existingData[url] = { title, ects };
    });
  } catch (error) {
    if (error.code !== 'ENOENT') {  // 'ENOENT' is the error code for 'File not found', which we can ignore initially.
      console.error('Error reading file:', error);
      return;
    }
  }

  if (!forceUpdate && existingData.hasOwnProperty(url)) {
    // If the URL is already scraped and forceUpdate is false, skip scraping
    return;
  }

  // Proceed with scraping if the URL is not in existingData or forceUpdate is true
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  const data = await page.evaluate(() => {
    const tdElements = Array.from(document.querySelectorAll('td'));
    let titleIndex = tdElements.findIndex(td => td.textContent.includes('Danish title'));
    if (titleIndex === -1) {
      titleIndex = tdElements.findIndex(td => td.textContent.includes('English title'));
    }
    const ectsIndex = tdElements.findIndex(td => td.textContent.includes('ECTS'));
    const titleValue = titleIndex !== -1 ? tdElements[titleIndex + 1].textContent.trim() : 'title not found';
    const ectsValue = ectsIndex !== -1 ? tdElements[ectsIndex + 1].textContent.trim() : 'ECTS points not found';
    return { titleValue, ectsValue };
  });

  await page.close();
  await browser.close();

  // Update or add new data
  existingData[url] = { title: `Title: ${data.titleValue}`, ects: `ECTS Points: ${data.ectsValue}` };
  const newDataArray = Object.entries(existingData).map(([url, { title, ects }]) => `${url}, ${title}, ${ects}`);

  // Append new data instead of overwriting
  await fs.appendFile(filePath, `${url}, Title: ${data.titleValue}, ECTS Points: ${data.ectsValue}\n`);

  console.log(data.titleValue, 'ECTS:', data.ectsValue);
  return Number(data.ectsValue);
}