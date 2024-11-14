sap.ui.define([
  "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("app.Component", {
    metadata: {
      manifest: "json" // Verweist auf das Manifest, das Metadaten zur Anwendung enthält
    },

    init: function () {

      UIComponent.prototype.init.apply(this, arguments);

      // Initialisierung des JSON-Modells und Zuordnung zur Komponente
      var oModel = new JSONModel("model/ZeiterfassungData.json");
      oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
      this.setModel(oModel, "zeiterfassung");

      // Initialisieren des Routers, um Navigation zu ermöglichen
      this.getRouter().initialize();
    }
  });
});


