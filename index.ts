#!/usr/bin/env bun

import { load } from "cheerio";
import { convert } from "html-to-text";
import styles from "ansi-styles";

const title = (string: string) => {
  return `${styles.redBright.open}${string}${styles.redBright.close}`;
};

const highlight = (string: string) => {
  return `${styles.green.open}${string}${styles.green.close}`;
};

export const highlightWord = (sentence: string, word: string) => {
  const formatted = convert(sentence);
  const regexp = new RegExp(`\\b${word}\\b`, "gi");
  const match = regexp.exec(formatted);

  if (!match || match.length === 0) {
    return formatted;
  }

  return formatted.replaceAll(regexp, highlight(match[0]));
};

const { argv } = process;
let query = argv.slice(2)[0];

if (query) {
  try {
    const test = await fetch(
      `https://www.vocabulary.com/dictionary/definition.ajax?search=${query}&lang=en`
    );

    const format = await test.text();

    const $ = load(format);
    const short = $("p.short").html();
    const long = $("p.long").html();
    const returnedWord = $("#hdr-word-area").text().trim();

    if (short || long) {
      query = query === returnedWord ? query : returnedWord;

      console.log("\n");
      console.log(title("Short"));
      short && console.log(highlightWord(short, query));
      console.log("\n");
      console.log(title("Long"));
      long && console.log(highlightWord(long, query));
    } else {
      throw Error("Not Found");
    }
  } catch (error) {
    console.log(title(error.message));
  }
} else {
  console.log("Query not found");
}
