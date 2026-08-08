import { NvidiaChatCompletionsProvider } from "./nvidia";
import { OpenAIResponsesProvider, type ProviderFetch } from "./openai";
import {
  parseAIProviderRuntime,
  type RuntimeEnvironment,
  type ServerRuntimeMode,
} from "./runtime";

export function createAIProviderFromEnv(
  env: RuntimeEnvironment,
  options: {
    runtimeMode: ServerRuntimeMode;
    fetchImpl?: ProviderFetch;
  },
) {
  const parsed = parseAIProviderRuntime(env, options.runtimeMode);
  if (parsed.mode === "disabled") return null;
  if (parsed.mode === "nvidia") {
    return new NvidiaChatCompletionsProvider(parsed.config, options.fetchImpl);
  }
  return new OpenAIResponsesProvider(parsed.config, options.fetchImpl);
}
