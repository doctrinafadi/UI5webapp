sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";



  return Controller.extend("app.controller.Main", {

    // Initialisierungsmethode
    onInit: function () {
      // Zugriff auf das "zeiterfassung"-Modell aus der Komponente und Setzen des Modells in der Ansicht
      var oModel = this.getOwnerComponent().getModel("zeiterfassung");
      this.getView().setModel(oModel, "zeiterfassung");

      // Berechnen der Fristinformationen und Setzen in die Text-Steuerung
      const deadlineInfo = getDeadlineInfo();
      const deadlineText = `Bestätigungsfrist: ${deadlineInfo.date} - ${deadlineInfo.days} Tage`;
      this.getView().byId("deadlineText").setText(deadlineText);

      // Hinzufügen eines Keydown-Eventlisteners für das Dokument (Enter-Taste)
      document.addEventListener("keydown", this._onKeyDown.bind(this));
      // Laden des i18n-Ressourcenbündels für lokalisierte Texte
      this._oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

    },
    // Behandlung von Keydown-Events (insbesondere der Enter-Taste)
    _onKeyDown: function (event) {
      // Überprüfen, ob die gedrückte Taste Enter ist
      if (event.key === "Enter") {
        // Auslösen des "validateButton"-Druckereignisses
        var oButton = this.getView().byId("validateButton");
        if (oButton) {
          oButton.firePress();
        }
      }
    },

    // Validierung der vom Benutzer eingegebenen Personalnummer
    onValidatePersonalnummer: function () {
      var oView = this.getView();
      var sEnteredPersonalnummer = oView.byId("personalNumberInput").getValue().trim();
      var oModel = oView.getModel("zeiterfassung");

      if (!sEnteredPersonalnummer) {
        MessageToast.show(this._oResourceBundle.getText("toast1"));
        return;
      }

      var aEmployees = oModel.getProperty("/employees");

      var oSelectedEmployee = null;
      for (var i = 0; i < aEmployees.length; i++) {
        if (aEmployees[i].Personalnummer === sEnteredPersonalnummer) {
          oSelectedEmployee = aEmployees[i];
          break;
        }
      }

      if (oSelectedEmployee) {
        MessageToast.show(this._oResourceBundle.getText("toast2"));
        oView.byId("employeeNameInput").setValue(oSelectedEmployee.Name);
        oView.byId("monthButtonsContainer").setVisible(true);
        oView.byId("personalNumberInput").setEnabled(false);
        oView.byId("validateButton").setEnabled(false);
        oView.byId("cancelButton").setVisible(true);
        oView.byId("panel2").setVisible(true);
        this._selectedEmployee = oSelectedEmployee;
      } else {
        MessageToast.show(this._oResourceBundle.getText("toast3"));
        oView.byId("employeeNameInput").setValue("");
        oView.byId("personalNumberInput").setValue("");
      }
    },


    // Behandlung des Abbrechen-Buttons, um die Benutzeroberfläche zurückzusetzen
    onCancel: function () {
      var oView = this.getView();
      MessageToast.show(this._oResourceBundle.getText("toast4"));
      oView.byId("personalNumberInput").setValue("");
      oView.byId("employeeNameInput").setValue("");
      oView.byId("monthButtonsContainer").setVisible(false);
      oView.byId("personalNumberInput").setEnabled(true);
      oView.byId("validateButton").setEnabled(true);
      oView.byId("cancelButton").setVisible(false);
      oView.byId("timeTable").setVisible(false);
      oView.byId("panel2").setVisible(false);
      this.getView().byId("SecondBox").setVisible(false);
      this.getView().byId("underbox").setVisible(false);
      this.getView().byId("panel3").setVisible(false);
      this.getView().byId("TotalHoursBox").setVisible(false);
      var aMonthButtons = this.getView().byId("monthButtonsContainer").getItems();
      for (var i = 0; i < aMonthButtons.length; i++) {
        aMonthButtons[i].removeStyleClass("selected");
      }
    },


    // Behandlung des Druckereignisses der Monatsschaltflächen
    onMonthButtonPress: function (oEvent) {
      var sMonth = oEvent.getSource().getText();
      var oModel = this.getView().getModel("zeiterfassung");
      var oSelectedEmployee = this._selectedEmployee;
      var aMonths = oSelectedEmployee.Months;
      var oSelectedMonth = aMonths.find(function (month) {
        return month.Month === sMonth;
      });

      if (oSelectedMonth) {
        this._originalData = oSelectedMonth.Days.map(function (day) {
          return JSON.parse(JSON.stringify(day));
        });
        oModel.setProperty("/selectedMonth", oSelectedMonth);
        this.getView().byId("timeTable").setVisible(true);
        this.getView().byId("MonthNameOutput").setText(sMonth + " 2024");
        this.getView().byId("SecondBox").setVisible(true);
        this.getView().byId("underbox").setVisible(true);
        this.getView().byId("panel3").setVisible(true);
        this.getView().byId("TotalHoursBox").setVisible(true);

        var aMonthButtons = this.getView().byId("monthButtonsContainer").getItems();
        for (var i = 0; i < aMonthButtons.length; i++) {
          aMonthButtons[i].removeStyleClass("selected");
        }

        oEvent.getSource().addStyleClass("selected");
      } else {
        MessageToast.show(this._oResourceBundle.getText("toast5"));
        this.getView().byId("SecondBox").setVisible(false);
        this.getView().byId("underbox").setVisible(false);
        this.getView().byId("timeTable").setVisible(false);
        var aMonthButtons = this.getView().byId("monthButtonsContainer").getItems();
        for (var i = 0; i < aMonthButtons.length; i++) {
          aMonthButtons[i].removeStyleClass("selected");
        }
      }

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("table");
    },


    // Behandlung des Speichern-Buttons, um Änderungen zu speichern
    onSaveChanges: function () {
      var oModel = this.getView().getModel("zeiterfassung");

      var updatedData = oModel.getData();

      jQuery.ajax({
        url: "http://localhost:3000/saveUpdatedData",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(updatedData),
        success: function () {
          MessageToast.show("Daten erfolgreich in der JSON-Datei gespeichert!");
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
          console.error('Status:', status);
          console.error('Response:', xhr.responseText);
          MessageToast.show("Fehler beim Speichern von Daten in der JSON-Datei");
        }
      });
    },


    // Berechnung der Brutto-Arbeitszeit basierend auf Start- und Endzeiten
    calculateBruttoworktime: function (sFrom, sTo) {
      if (sFrom && sTo) {
        var from = this._parseTime(sFrom);
        var to = this._parseTime(sTo);
        var diff = to - from;
        return this._formatHours(diff);
      }
      return "0.00 h";
    },


    // Berechnung der Netto-Arbeitszeit basierend auf Startzeit, Endzeit und Pausenzeit
    calculateNettoworktime: function (sFrom, sTo, sPause) {
      if (sFrom && sTo && sPause) {
        var from = this._parseTime(sFrom);
        var to = this._parseTime(sTo);
        var pause = this._parseTime(sPause);
        var brutto = to - from - pause;
        return this._formatHours(brutto);
      }
      return "0.00 h";
    },

    // Parsen einer Zeitzeichenkette in Millisekunden
    _parseTime: function (timeStr) {
      var parts = timeStr.split(':');
      return parseInt(parts[0], 10) + parseFloat(parts[1] / 60);
    },

    // Formatieren der Zeit in Stunden
    _formatHours: function (hours) {
      return hours.toFixed(2) + " h";
    },

    // Behandlung des Dateiupload-Events
    onFileChange: function (oEvent) {
      var oFileUploader = this.byId("fileUploader");
      var oFile = oEvent.getParameter("files") && oEvent.getParameter("files")[0];

      if (oFile) {
        var oReader = new FileReader();
        oReader.onload = function (e) {
          var sBase64 = e.target.result;
          this.byId("signatureImage").setSrc(sBase64);
          this.byId("signatureImage").setVisible(true);
          MessageToast.show(this._oResourceBundle.getText("toast6"));
        }.bind(this);

        oReader.readAsDataURL(oFile);
      }
    },


    // Behandlung des Export-Buttons, um die Seite als PDF-Datei zu exportieren
    onExportPDF: function () {
      MessageToast.show(this._oResourceBundle.getText("toast7"));
      var panel2 = this.byId("panel2");

      if (!panel2) {
        return;
      }

      if (typeof html2canvas !== "function") {
        console.error("html2canvas is not loaded correctly.");
        return;
      }

      html2canvas(panel2.getDomRef(), {
        scale: 2,
        useCORS: true
      }).then(function (canvas) {
        var imgData = canvas.toDataURL('image/png');
        var contentWidth = canvas.width;
        var contentHeight = canvas.height;
        var pdfWidth = contentWidth * 0.264583;
        var pdfHeight = contentHeight * 0.264583;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });

        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save('panel2.pdf');
      }).catch(function (error) {
        console.error("html2canvas error: ", error);
      });
    },


    // Methode zur Berechnung der Gesamtsumme der Arbeitsstunden
    OnCalculateTotal: function () {
      this.calculateTotalNettoWorktime();
    },

    // Methode zur Berechnung der GesamtNettoarbeitszeit
    calculateTotalNettoWorktime: function () {
      var oModel = this.getView().getModel("zeiterfassung");
      var selectedMonth = oModel.getProperty("/selectedMonth");
      var totalNettoHours = 0;

      if (selectedMonth && selectedMonth.Days) {
        selectedMonth.Days.forEach(function (day) {
          var nettoHours = this.calculateNettoworktime(day.von, day.bis, day.pause);
          totalNettoHours += parseFloat(nettoHours);
        }.bind(this));

        // Update the total netto worktime text control
        var totalNettoTextControl = this.getView().byId("totalNettoWorktimeText");
        totalNettoTextControl.setText(this._oResourceBundle.getText("maincont1") + " " + totalNettoHours.toFixed(2) + " h");
      }
    },

    // Methode zur Navigation zur Erfolgsmeldung
    onTransferTable: function () {

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("success");
    }

  });

  //Funktion zur Bestimmung der Deadline der Bestätigung
  function getDeadlineInfo() {
    const today = new Date();
    const nextMonth = today.getMonth() + 1;
    const year = today.getFullYear();
    const deadline = new Date(year, nextMonth, 2);
    const timeDiff = deadline - today;
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const deadlineDate = deadline.toLocaleDateString('de-DE'); // Format the date in German locale
    return {
      date: deadlineDate,
      days: dayDiff
    };
  }

});

