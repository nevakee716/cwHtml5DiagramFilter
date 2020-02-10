/*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  "use strict";
  cwApi.Diagrams.CwDiagramViewer.prototype.clickOnCanvas = function(e) {
    var regionZone, cwObject, link;

    if (this.currentContext.selectedShape !== null && this.currentContext.selectedJoiner === null) {
      regionZone = this.currentContext.selectedRegionZone;
      if (!cwApi.isUndefinedOrNull(regionZone)) {
        if (this.currentContext.selectedShape.shape.paletteEntryKey === "OBJECTLINK|0") {
          // Object link
          cwObject = this.currentContext.selectedShape.shape.cwObject;
          if (cwObject !== undefined && cwObject !== null && cwObject.properties !== undefined && cwObject.properties !== null) {
            link = cwObject.properties.link;
            if (link.indexOf("http://") !== 0 && link.indexOf("https://") !== 0 && link.indexOf("/") !== 0 && link.indexOf("./") !== 0 && link !== "") {
              link = "http://" + link;
            }
            window.open(link, "_blank");
          }
        } else if (regionZone.IsExplosionRegion === true) {
          // Explosion
          this.openDiagrams(regionZone.explodedDiagrams);
        } else if (regionZone.IsNavigationRegion === true) {
          // Navigation
          this.openDiagrams(regionZone.navigationDiagrams);
        } else if (regionZone.RegionTypeString === "MultiplePropertyAssociations" || regionZone.RegionTypeString === "Association") {
          if (cwAPI.customLibs && cwAPI.customLibs.utils && cwAPI.customLibs.utils.createPopOutFormultipleObjects) cwAPI.customLibs.utils.createPopOutFormultipleObjects(regionZone.filteredObjects);
        } else if (regionZone.Clickable === true) {
          // Clickable regions
          if (!cwApi.isUndefined(regionZone) && regionZone.ClickableRegionUrl !== "") {
            window.open(regionZone.ClickableRegionUrl, "_blank");
          }
        }
      } else {
        cwObject = this.currentContext.selectedShape.shape.cwObject;
        if (cwObject !== null) {
          // NOTE: If there is any action to take on a click, so far on a click only Explosions and Navigation should take action
          this.simpleClickOnShape(cwObject, e);
          this.simpleClickOnShapeCustom(cwObject);
        }
      }
    } else {
      if (this.isInEditMode === true) {
        if (this.currentContext.selectedJoiner !== null) {
          cwApi.pluginManager.execute("CwDiagramViewer.SimpleClickOnJoiner", this, this.currentContext.selectedJoiner, e);
        } else {
          cwApi.pluginManager.execute("CwDiagramViewer.ClickOnCanvasNotAnyShape", this, e);
        }
      } else {
        this.resetSelectedShapesForEditor();
      }
    }
  };
})(cwAPI, jQuery);
