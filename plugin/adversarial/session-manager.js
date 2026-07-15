export class SessionManager {
  constructor(client, directory) {
    this.client = client;
    this.directory = directory;
  }

  async runAgent(prompt, opts = {}) {
    const label = opts.label || 'agent';

    const session = await this.client.session.create({
      directory: this.directory,
    });

    const promptOpts = { prompt };
    if (opts.model) {
      promptOpts.model = {
        providerID: opts.model.providerID,
        modelID: opts.model.modelID,
      };
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
