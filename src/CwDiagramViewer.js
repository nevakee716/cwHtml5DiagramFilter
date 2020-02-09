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
        } else if (regionZone.RegionTypeString === "MultiplePropertyAssociations") {
          this.createDialogForAssociationsRegion(regionZone.filteredObjects);
        } else if (regionZone.RegionTypeString === "Association") {
          this.createDialogForAssociationsRegion(regionZone.filteredObjects);
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

  // Dialog for multiple diagrams explosion
  cwApi.Diagrams.CwDiagramViewer.prototype.createDialogForAssociationsRegion = function(objects) {
    var that, o, $div, $ul, i;
    if (objects.length === 0) return;
    cwApi.CwPopout.show(cwApi.mm.getObjectType(objects[0].objectTypeScriptName).pluralName);
    cwApi.CwPopout.onClose(function() {
      cwApi.unfreeze();
    });

    let popOutName = cwApi.replaceSpecialCharacters(objects[0].objectTypeScriptName) + "_diagram_popout";
    let popoutExist = cwAPI.ViewSchemaManager.pageExists(popOutName);
    //function outputImage($li, explodedDiagram) {
    //    var image = new Image();
    //    const random = cwApi.getRandomNumber();
    //    image.src = cwApi.getSiteMediaPath() + 'images/diagrams/diagram' + explodedDiagram.object_id + '.png?' + random;
    //    image.onload = function () {
    //        $li.children().first().before('<img class="cwMiniImageDiagramPreview" src="' + image.src + '"/>');
    //    };
    //}
    o = [];
    that = this;
    o.push('<form action="#" class="form-select">');
    if (popoutExist) o.push("<h3>", $.i18n.prop("diagram_selectAObjectToView"), "</h3>");
    o.push('<div class="cwDiagramExplosionMultipleChoice"><ul>');
    o.push("</ul></div>");
    o.push("</form>");
    $div = $(o.join(""));
    cwApi.CwPopout.setContent($div);

    function createDialog(obj) {
      var miniO = [],
        $li;
      miniO.push("<li>");
      if (cwAPI.customLibs && cwAPI.customLibs.utils && cwAPI.customLibs.utils.getCustomDisplayString) {
        miniO.push(cwAPI.customLibs.utils.getCustomDisplayString("", obj));
        $li = $(miniO.join(""));
      } else {
        miniO.push("<div>", obj.name, "</div>", "</li>");
        $li = $(miniO.join(""));
        if (popoutExist) {
          $li.click(function() {
            cwAPI.cwDiagramPopoutHelper.openDiagramPopout(obj, popOutName);
          });
        }
      }

      $ul.append($li);
    }

    $ul = $div.find("ul").first();
    for (i = 0; i < objects.length; i += 1) {
      createDialog(objects[i]);
    }
  };
})(cwAPI, jQuery);
