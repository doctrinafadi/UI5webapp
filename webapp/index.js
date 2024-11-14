sap.ui.define([
  "sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
  "use strict";

  // Erstellen eines neuen ComponentContainers, der die UI5-Komponente lädt
  new ComponentContainer({
    name: "app",
    settings: {
      id: "app"
    },
    async: true
  }).placeAt("content"); // Platzieren des Containers im HTML-Element mit der ID 'content'
});



