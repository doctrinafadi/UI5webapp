sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox"
], function (Controller, MessageBox) {
  "use strict";

  return Controller.extend("app.controller.Success", {


    // Event-Handler für den Ausloggen-Button
    onCloseApp: function () {
      var that = this;

      // Zeigt ein Bestätigungsdialogfeld an, bevor die App geschlossen wird
      MessageBox.confirm("Ihr Vorgesetzter wird benachrichtigt, um Ihre Arbeitszeiten zu überprüfen und zu bestätigen. Anwendung schließen?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (sAction) {
          if (sAction === MessageBox.Action.YES) {
            // Wenn 'Ja' gewählt wird, schließt sich die Anwendung
            window.location.replace("http://localhost:8080/"); // Weiterleitung auf die Startseite des Servers
          }
        }
      });
    }
  });
});
