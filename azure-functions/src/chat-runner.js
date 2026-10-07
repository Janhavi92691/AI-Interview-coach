import { getAzureOpenAIClient, getDeploymentName } from "./openai-client.js";

export async function runStructuredPrompt({ systemPrompt, userPrompt, schema, temperature = 0.3 }) {
  const client = getAzureOpenAIClient();
  const deployment = getDeploymentName();

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const completion = await client.chat.completions.create({
    model: deployment,
    messages,
    temperature,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices?.[0]?.message?.content || "{}";
  let parsedJson;
  try {
    parsedJson = JSON.parse(rawContent);
  } catch (err) {
    throw new Error(`Invalid JSON returned by model: ${err.message}`);
  }

  const validation = schema.safeParse(parsedJson);
  if (validation.success) {
    return validation.data;
  }

  // Auto-repair once
  const repairMessages = [
    ...messages,
    { role: "assistant", content: rawContent },
    {
      role: "user",
      content: `Your previous response did not match the required schema: ${validation.error.message}. Please fix and return ONLY valid JSON matching the schema.`,
    },
  ];

  const repairCompletion = await client.chat.completions.create({
    model: deployment,
    messages: repairMessages,
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const repairContent = repairCompletion.choices?.[0]?.message?.content || "{}";
  const repairedJson = JSON.parse(repairContent);
  return schema.parse(repairedJson);
}
