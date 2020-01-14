/*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  "use strict";

  var PsgDiagramFilterConfig = {
    index_portefeuilles_applicatifs: {
      "Vue B0 Fonctionnel - Géréral": {
        application: ["name", "type", "DATEDEDÉBUTDÉVALUATION", "DATEDEMISEENPRODUCTION", "DATEDEDÉBUTDEDÉCOMMISSIONNEMENT", "DATEDEFINDEDÉCOMMISSIONNEMENT", "criticité", "enterprisestandard", "critiquepourréglementationsrgpd", "contientdesdonnéessensibles"],
        application_date: {
          step1: {
            name: "Evaluation",
            start: "DATEDEDÉBUTDÉVALUATION",
            end: "DATEDEMISEENPRODUCTION",
            color: "blue",
          },
          step2: {
            name: "Production",
            start: "DATEDEMISEENPRODUCTION",
            end: "DATEDEDÉBUTDEDÉCOMMISSIONNEMENT",
            color: "green",
          },
          step3: {
            name: "Décommissionnement",
            start: "DATEDEDÉBUTDEDÉCOMMISSIONNEMENT",
            end: "DATEDEFINDEDÉCOMMISSIONNEMENT",
            color: "orange",
          },
          out: {
            name: "Out",
            color: "red",
          },
        },
      },
    },
    default: {
      "PA - Sub Process Workflow": {
        process: ["name", "PROCESSTOASSOROBOTTOPROCESSTOROBOT"],
      },
      "PA - Value Stream Breakdown": {
        process: ["type", "name"],
      },
    },
    date: "09/03/2018",
  };

  if (!cwApi.customLibs) {
    cwApi.customLibs = {};
  }
  if (!cwApi.customLibs.PsgDiagramFilter) {
    cwApi.customLibs.PsgDiagramFilterConfig = PsgDiagramFilterConfig;
  }
})(cwAPI, jQuery);
