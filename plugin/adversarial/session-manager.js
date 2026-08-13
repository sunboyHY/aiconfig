export class SessionManager {
  constructor(client, directory, modelCatalog = []) {
    this.client = client;
    this.directory = directory;
    this.modelCatalog = modelCatalog;
  }

  _resolveModel(opts = {}) {
    if (!opts.model) return null;
    const { providerID, modelID } = opts.model;
    const match = this.modelCatalog.find(
      (m) =>
        m.providerID === providerID &&
        m.modelID === modelID &&
        m.available
    );
    if (!match) {
      const available = this.modelCatalog
        .filter((m) => m.available)
        .map((m) => `${m.providerID}/${m.modelID}`)
        .join(', ');
      throw new Error(
        `Model ${providerID}/${modelID} not found or unavailable. ` +
          `Available models: ${available || 'none detected'}`
      );
    }
    return { providerID, modelID };
  }

  async runAgent(prompt, opts = {}) {
    const label = opts.label || 'agent';

    const session = await this.client.session.create({
      directory: this.directory,
    });

    const promptOpts = { prompt };
    const resolvedModel = this._resolveModel(opts);
    if (resolvedModel) {
      promptOpts.model = resolvedModel;
    }
    if (opts.agent) {
      promptOpts.agent = opts.agent;
    }

    const response = await this.client.session.prompt(session.id, promptOpts);

    const text = this._extractText(response);

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { text };
    }

    return {
      sessionId: session.id,
      label,
      result,
      raw: text,
    };
  }

  async runParallel(thunks) {
    return Promise.all(
      thunks.map(async (thunk) => {
        try {
          return await thunk();
        } catch (error) {
          return { error: error.message };
        }
      })
    );
  }

  async runPipeline(items, stages) {
    let data = items;
    for (const stage of stages) {
      if (Array.isArray(stage)) {
        data = await Promise.all(
          data.map(async (item) => {
            let value = item;
            for (const fn of stage) {
              value = await fn(value);
            }
            return value;
          })
        );
      } else {
        data = await Promise.all(
          data.map(async (item) => await stage(item))
        );
      }
    }
    return data;
  }

  _extractText(response) {
    if (!response) return '';
    if (typeof response === 'string') return response;

    const data = response.data || response;
    const msg = data.message || data;

    if (msg && msg.parts) {
      return msg.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('\n');
    }

    if (msg && msg.content) {
      return this._extractText(msg.content);
    }

    return JSON.stringify(data);
  }
}
