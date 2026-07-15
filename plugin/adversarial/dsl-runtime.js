export class WorkflowRuntime {
  constructor(sessionManager, directory) {
    this.sessionManager = sessionManager;
    this.directory = directory;
    this.logs = [];
  }

  async execute(script, args = {}) {
    this.logs = [];

    const cleanScript = script.replace(/^export\s+/gm, '');
    const sessionManager = this.sessionManager;

    const phaseFn = (title) => {
      this.logs.push({ type: 'phase', title });
    };

    const logFn = (message) => {
      this.logs.push({ type: 'log', message });
    };

    const agentFn = async (prompt, opts = {}) => {
      return await sessionManager.runAgent(prompt, opts);
    };

    const parallelFn = async (thunks) => {
      return await sessionManager.runParallel(thunks);
    };

    const pipelineFn = async (items, ...stages) => {
      return await sessionManager.runPipeline(items, stages);
    };

    const fnBody = `
      return (async () => {
        ${cleanScript}
      })();
    `;

    const fn = new Function(
      'agent', 'parallel', 'pipeline', 'phase', 'log', 'args',
      'JSON', 'Math', 'Array',
      fnBody
    );

    const result = await fn(
      agentFn,
      parallelFn,
      pipelineFn,
      phaseFn,
      logFn,
      args,
      JSON,
      Math,
      Array
    );

    return {
      result,
      logs: this.logs,
    };
  }
}
