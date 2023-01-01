type CallbackFunction = (props: any) => void;

/**
 * Starchart class
 */
export class Starchart {
  _name: string;

  /**
   *
   * @param {string} name Name of the component
   */
  constructor(name: string) {
    this._name = name;
  }

  /**
   * Subscribe to any "state" property update for this component
   * @param {CallbackFunction} cb Callback function to call when any event property is updated
   * @return {void}
   */
  onUpdate(cb: CallbackFunction) {
    return this.subscribe(cb, null);
  }

  /**
   *  Subscribe to a specific "state" property update for this component
   * @param {string} prop Event property to subscribe to
   * @param {CallbackFunction} cb Callback function to call when the event property is updated
   * @return {void}
   */
  onUpdateTo(prop: string, cb: CallbackFunction) {
    return this.subscribe(cb, prop);
  }

  /**
   * Subscribe to any "state" property update for this component
   * @param {CallbackFunction} cb Callback function to call when any event property is updated
   * @param {string|null} prop Event property to subscribe to, or "null" to subscribe to all properties
   * @return {void}
   */
  subscribe(cb: CallbackFunction, prop: string | null = null): void {
    window.addEventListener('starchart:update', (e) => {
      const { detail } = e as CustomEvent;

      if (detail?.component === this._name) {
        const { props } = detail;
        if (prop) {
          if (Object.keys(props).includes(prop)) {
            cb(props[prop]);
          }
        } else {
          cb(props);
        }
      }
    });
  }

  /**
   * Send updated property and value to the parent window
   * @param {string} prop
   * @param {strig} value
   */
  send(prop: string, value: string): void {
    parent.postMessage(
      {
        from: 'starchart',
        component: this._name,
        prop,
        value,
      },
      window.location.origin,
    );
  }
}
