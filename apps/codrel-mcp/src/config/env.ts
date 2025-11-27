import dotenv from "dotenv";

dotenv.config({quiet : true});

export const envConfig = {
  codrel: {
    token: process.env.CODREL_TOKEN,
  }
} as const;
