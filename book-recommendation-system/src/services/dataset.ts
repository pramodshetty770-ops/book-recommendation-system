import { parseCSVString, processRawData, ParseResult } from "../recommendation/preprocessing";

export async function loadDefaultDatasets(): Promise<ParseResult> {
  try {
    const [booksRes, ratingsRes] = await Promise.all([
      fetch("/data/books.csv"),
      fetch("/data/ratings.csv"),
    ]);

    if (!booksRes.ok) {
      throw new Error(`Failed to fetch books.csv: ${booksRes.statusText}`);
    }
    if (!ratingsRes.ok) {
      throw new Error(`Failed to fetch ratings.csv: ${ratingsRes.statusText}`);
    }

    const booksText = await booksRes.text();
    const ratingsText = await ratingsRes.text();

    const rawBooks = await parseCSVString<any>(booksText);
    const rawRatings = await parseCSVString<any>(ratingsText);

    return processRawData(rawBooks, rawRatings);
  } catch (error: any) {
    return {
      dataset: null as any,
      errors: [error.message || "An unexpected error occurred while loading dataset."],
    };
  }
}

export async function loadCustomDatasets(
  booksFile: File,
  ratingsFile: File
): Promise<ParseResult> {
  try {
    const booksText = await booksFile.text();
    const ratingsText = await ratingsFile.text();

    const rawBooks = await parseCSVString<any>(booksText);
    const rawRatings = await parseCSVString<any>(ratingsText);

    return processRawData(rawBooks, rawRatings);
  } catch (error: any) {
    return {
      dataset: null as any,
      errors: [error.message || "Failed to parse custom uploaded CSV files."],
    };
  }
}
