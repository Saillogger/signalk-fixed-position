# Fixed Position Plugin

This is a simple plugin that publishes a static `navigation.position` every 30 seconds. Latitude and longitude are set through the plugin configuration.

This plugin is useful when the GPS source is turned off (e.g., at a marina) but you want to keep using plugins that require position data (such as the Saillogger or Windy plugins).

You should set a lower priority for positions emitted by this plugin to ensure they are ignored when your actual GPS source is powered on.