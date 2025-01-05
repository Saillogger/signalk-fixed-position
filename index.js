/*
 * Copyright 2024 Ilker Temir <ilker@ilkertemir.com>
 * Copyright 2025 Saillogger LLC (info@saillogger.com)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (app) {
  var plugin = {};
  var unsubscribes = [];
  var timer = null;
  var lastUpdate = Date.now();  // Track timestamp internally

  plugin.id = "signalk-fixed-position";
  plugin.name = "Fixed Position";
  plugin.description = "Plugin to submit last known or fixed position reports";

  plugin.schema = {
    type: 'object',
    properties: {
      interval: {
        type: 'number',
        title: 'Update interval in seconds',
        default: 15
      },
      position: {
        type: 'object',
        title: 'Stored Position',
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' }
        }
      }
    }
  };

  plugin.start = function (options) {
    app.subscriptionmanager.subscribe({
      context: 'vessels.self',
      subscribe: [{
        path: 'navigation.position',
        period: 1000
      }]
    }, unsubscribes, 
    error => {
      app.error('Position subscription error:' + error);
    },
    delta => {
      if (!delta.updates)
        return;
      delta.updates.forEach(update => {
        update.values.forEach(value => {
          if (value.path === 'navigation.position') {
            options.position = {
              latitude: value.value.latitude,
              longitude: value.value.longitude
            };
            lastUpdate = Date.now();  // Update internal timestamp
            app.savePluginOptions(options, () => {
              app.debug(`Position saved ${options.position.latitude}, ${options.position.longitude}.`);
	    });
          }
        });
      });
    });

    timer = setInterval(() => {
      if (Date.now() - lastUpdate > options.interval * 1000) {
        if (options.position) {
          app.debug(`Emitting position ${options.position.latitude}, ${options.position.longitude}.`);
          app.handleMessage(plugin.id, {
            updates: [{
              values: [{
                path: 'navigation.position',
                value: {
                  latitude: options.position.latitude,
                  longitude: options.position.longitude
                }
              }]
            }]
          });
        }
      }
    }, options.interval * 1000);
  };

  plugin.stop = function () {
    unsubscribes.forEach(f => f());
    unsubscribes = [];
    if (timer) {
      clearInterval(timer);
    }
  };

  return plugin;
};

