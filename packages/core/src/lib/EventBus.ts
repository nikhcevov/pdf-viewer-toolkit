/* eslint-disable @typescript-eslint/no-unsafe-function-type */

interface Options {
  external?: boolean;
  once?: boolean;
  signal?: AbortSignal;
}

// TODO: Add generics

/**
 * Simple event bus for an application. Listeners are attached using the `on`
 * and `off` methods. To raise an event, the `dispatch` method shall be used.
 */
export class EventBus {
  #listeners = Object.create(null);

  on(eventName: string, listener: Function, options: Options | null = null) {
    this._on(eventName, listener, {
      external: true,
      once: options?.once,
      signal: options?.signal,
    });
  }

  off(eventName: string, listener: Function) {
    this._off(eventName, listener);
  }

  dispatch(eventName: string, data: object) {
    const eventListeners = this.#listeners[eventName];
    if (!eventListeners || eventListeners.length === 0) {
      return;
    }
    let externalListeners;
    // Making copy of the listeners array in case if it will be modified
    // during dispatch.
    for (const { listener, external, once } of eventListeners.slice(0)) {
      if (once) {
        this._off(eventName, listener);
      }
      if (external) {
        (externalListeners ||= []).push(listener);
        continue;
      }
      listener(data);
    }
    // Dispatch any "external" listeners *after* the internal ones, to give the
    // viewer components time to handle events and update their state first.
    if (externalListeners) {
      for (const listener of externalListeners) {
        listener(data);
      }
      externalListeners = null;
    }
  }

  /**
   * @ignore
   */
  _on(eventName: string, listener: Function, options: Options | null = null) {
    let rmAbort = null;
    if (options?.signal instanceof AbortSignal) {
      const { signal } = options;
      if (signal.aborted) {
        console.error("Cannot use an `aborted` signal.");
        return;
      }
      const onAbort = () => this._off(eventName, listener);
      rmAbort = () => signal.removeEventListener("abort", onAbort);

      signal.addEventListener("abort", onAbort);
    }

    const eventListeners = (this.#listeners[eventName] ||= []);
    eventListeners.push({
      listener,
      external: options?.external === true,
      once: options?.once === true,
      rmAbort,
    });
  }

  /**
   * @ignore
   */
  _off(eventName: string, listener: Function) {
    const eventListeners = this.#listeners[eventName];
    if (!eventListeners) {
      return;
    }
    for (let i = 0, ii = eventListeners.length; i < ii; i++) {
      const evt = eventListeners[i];
      if (evt.listener === listener) {
        evt.rmAbort?.(); // Ensure that the `AbortSignal` listener is removed.
        eventListeners.splice(i, 1);
        return;
      }
    }
  }
}
