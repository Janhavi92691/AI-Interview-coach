import { AzureOpenAI } from "openai";

let clientInstance = null;

export function getAzureOpenAIClient() {
  if (clientInstance) return clientInstance;

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  if (!endpoint || !apiKey) {
    throw new Error("Missing Azure OpenAI configuration in Function App settings.");
  }

  clientInstance = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
  });

  return clientInstance;
}

export function getDeploymentName() {
  return process.env.AZURE_OPENAI_DEPLOYMENT_NAME || process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
}
