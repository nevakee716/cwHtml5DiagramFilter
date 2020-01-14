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

  PsgDiagramFilterManager.prototype.setGlobalAlphaRegion = function(diagramViewer, shape) {
    if (this.PsgDiagramFilter.hasOwnProperty(diagramViewer.id)) {
      this.PsgDiagramFilter[diagramViewer.id].setGlobalAlphaRegion(diagramViewer, shape);
    }
  };

  PsgDiagramFilterManager.prototype.resetGlobalAlpha = function(diagramViewer, shape) {
    if (this.PsgDiagramFilter.hasOwnProperty(diagramViewer.id)) {
      this.PsgDiagramFilter[diagramViewer.id].resetGlobalAlpha(diagramViewer, shape);
    }
  };

  PsgDiagramFilterManager.prototype.register = function() {
    cwApi.pluginManager.register("CwDiagramViewer.initWhenDomReady", this.init.bind(this));
    cwApi.pluginManager.register("CwDiagramViewer.beforeDrawShapeRegion", this.setGlobalAlphaRegion.bind(this));
    cwApi.pluginManager.register("CwDiagramViewer.afterDrawShapeRegion", this.resetGlobalAlpha.bind(this));
    //cwApi.pluginManager.register("CwDiagramViewer.tickEnd", this.manageGPS.bind(this));
  };

  function shouldDisplayJoiner(diagramViewer, joiner) {
    var toShape, fromShape;

    if (diagramViewer.isInEditMode === true) {
      toShape = diagramViewer.getDiagramShapeBySequence(joiner.joiner.ToSeq);
      fromShape = diagramViewer.getDiagramShapeBySequence(joiner.joiner.FromSeq);
      if (toShape !== undefined && fromShape !== undefined && toShape !== null && fromShape !== null) {
        if (toShape.shape.moveTo !== undefined || fromShape.shape.moveTo !== undefined) {
          return false;
        }
      }
    }
    return true;
  }

  cwApi.CwPlugins.PsgDiagramFilter = PsgDiagramFilterManager;

  /********************************************************************************
  Activation
  *********************************************************************************/
  new cwApi.CwPlugins.PsgDiagramFilter().register();
})(cwAPI, jQuery);
