import { SessionManager } from './session-manager.js';
import { WorkflowRuntime } from './dsl-runtime.js';

export const AdversarialPlugin = async ({ client, directory }) => {
  const sessionManager = new SessionManager(client, directory);
  const runtime = new WorkflowRuntime(sessionManager, directory);

  return {
    tool: {
      workflow: {
        description:
          'Execute a workflow script that orchestrates multiple sub-agents. Use this for adversarial mode, multi-agent analysis, parallel exploration, or any task requiring fan-out execution. The script is JavaScript DSL with agent(), parallel(), pipeline(), phase(), and log().',
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
