/*
 * Copyright 2024 Ilker Temir <ilker@ilkertemir.com>
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


module.exports = function(app) {
  var plugin = {};
  var positionPublish;

  plugin.id = "signalk-fixed-position";
  plugin.name = "Fixed Position";
  plugin.description = "Plugin to submit fixed position reports";

  plugin.schema = {
    type: 'object',
    required: ['latitude', 'longitude'],
    properties: {
      latitude: {
        type: "number",
        title: "Latitude to publish"
      },
      longitude: {
        type: "number",
        title: "Longitude to publish"
      },
    }
  }

  plugin.start = function(options) {
    if ((!options.latitude) || (!options.longitude)) {
      app.error('Latitude and Longitude are required')
      return;
    }
    positionPublish = setInterval(function () {
      app.debug(`Publish position (${options.latitude}, ${options.longitude})`);
      let values = [
        {
          path: 'navigation.position',
          value: {
            'longitude': options.longitude,
            'latitude': options.latitude
          }
        }
      ]
      app.handleMessage(plugin.id, {
        updates: [{
            values: values
          }]
      });
    }, 30*1000);
  }

  plugin.stop =  function() {
    clearInterval(positionPublish);
    app.setPluginStatus('Pluggin stopped');
  };

  return plugin;
}
