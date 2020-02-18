/*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  "use strict";

  var PsgDiagramFilterManager;

  PsgDiagramFilterManager = function() {
    this.PsgDiagramFilter = {};
  };

  PsgDiagramFilterManager.prototype.init = function(diagramViewer) {
    this.PsgDiagramFilter[diagramViewer.id] = new cwApi.customLibs.PsgDiagramFilter(diagramViewer);
  };

  PsgDiagramFilterManager.prototype.setGlobalAlphaRegion = function(diagramShape, shape, region) {
    if (this.PsgDiagramFilter.hasOwnProperty(diagramShape.diagramCanvas.id)) {
      this.PsgDiagramFilter[diagramShape.diagramCanvas.id].setGlobalAlphaRegion(diagramShape, region);
    }
  };

  PsgDiagramFilterManager.prototype.resetGlobalAlpha = function(diagramShape, shape, region) {
    if (this.PsgDiagramFilter.hasOwnProperty(diagramShape.diagramCanvas.id)) {
      this.PsgDiagramFilter[diagramShape.diagramCanvas.id].drawNumberOfAssociation(diagramShape, region);
      this.PsgDiagramFilter[diagramShape.diagramCanvas.id].resetGlobalAlpha(diagramShape, region);
    }
  };

  PsgDiagramFilterManager.prototype.register = function() {
    cwApi.pluginManager.register("CwDiagramViewer.initWhenDomReady", this.init.bind(this));
    cwApi.pluginManager.register("CwDiagramViewer.beforeDrawShapeRegion", this.setGlobalAlphaRegion.bind(this));
    cwApi.pluginManager.register("CwDiagramViewer.afterDrawShapeRegion", this.resetGlobalAlpha.bind(this));
  };

  cwApi.CwPlugins.PsgDiagramFilter = PsgDiagramFilterManager;

  /********************************************************************************
  Activation
  *********************************************************************************/
  new cwApi.CwPlugins.PsgDiagramFilter().register();
})(cwAPI, jQuery);
