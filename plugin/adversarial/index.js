import { SessionManager } from './session-manager.js';
import { WorkflowRuntime } from './dsl-runtime.js';

async function discoverModels(client) {
  const catalog = [];
  try {
    const providers = await client.provider.list();
    const providerList = providers.data || providers;
    for (const provider of providerList) {
      const pid = provider.id || provider.providerID || provider.name;
      if (!pid) continue;
      const models = provider.models || [];
      for (const model of models) {
        const mid = model.id || model.modelID || model.name;
        if (!mid) continue;
        catalog.push({
          providerID: pid,
          modelID: mid,
          available: true,
        });
      }
    }
  } catch {
    catalog.push({ providerID: 'unknown', modelID: 'unknown', available: false });
  }
  return catalog;
}

function buildModelTable(catalog) {
  if (!catalog.length) return 'No models detected.';
  const rows = catalog
    .filter((m) => m.available)
    .map(
      (m) =>
        `| \`${m.providerID}\` | \`${m.modelID}\` | ${m.providerID}/${m.modelID} |`
    );
  return `| providerID | modelID | 完整标识 |\n|-----------|---------|----------|\n${rows.join('\n')}`;
}

export const AdversarialPlugin = async ({ client, directory }) => {
  const modelCatalog = await discoverModels(client);
  const sessionManager = new SessionManager(client, directory, modelCatalog);
  const runtime = new WorkflowRuntime(sessionManager, directory, modelCatalog);

  const modelTable = buildModelTable(modelCatalog);

  return {
    tool: {
      workflow: {
        description:
          `Execute a workflow script that orchestrates multiple sub-agents. Use this for adversarial mode, multi-agent analysis, parallel exploration, or any task requiring fan-out execution. The script is JavaScript DSL with agent(), parallel(), pipeline(), phase(), and log().\n\n` +
          `## Available Models (from current opencode config)\n\n${modelTable}\n\n` +
          `When specifying a model for an agent, use { providerID, modelID } matching the table above. If model is omitted, the parent agent's model is used.`,
        args: {
          script: {
            description:
              'JavaScript DSL workflow script. Must use agent()/parallel()/pipeline() to orchestrate. The final return value is the workflow result.',
          },
          args: {
            description:
              'Optional arguments object, accessible as the global `args` variable inside the script.',
          },
        },
        async execute(input, context) {
          const { script, args = {} } = input;

          try {
            const { result, logs } = await runtime.execute(script, args);
            return JSON.stringify({ result, logs }, null, 2);
          } catch (error) {
            return JSON.stringify(
              {
                error: error.message,
                stack: error.stack,
                availableModels: modelCatalog.filter((m) => m.available),
              },
              null,
              2
            );
          }
        },
      },
    },
  };
};
