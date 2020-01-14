/*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  "use strict";

  var PsgDiagramFilter;

  PsgDiagramFilter = function(diagramViewer) {
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    function rgb2hex(rgb) {
      rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+\.*\d+)?\)$/);
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    this.globalAlpha = 0.2;
    this.title1 = "Filter";
    this.title2 = diagramViewer.json.properties.type;
    this.falseString = "False";
    this.trueString = "True";
    this.regionsByObjectType = {};
    this.diagramViewer = diagramViewer;
    this.template = this.diagramViewer.json.properties.type;
    var v = cwAPI.getCurrentView();
    if (v) this.view = v.cwView;
    if (cwApi.customLibs.PsgDiagramFilterConfig) {
      if (cwApi.customLibs.PsgDiagramFilterConfig.hasOwnProperty(this.view)) {
        if (cwApi.customLibs.PsgDiagramFilterConfig[this.view].hasOwnProperty(this.diagramViewer.json.properties.type)) {
          this.config = cwApi.customLibs.PsgDiagramFilterConfig[this.view][this.diagramViewer.json.properties.type];
        } else {
          this.config = null;
        }
      } else {
        if (cwApi.customLibs.PsgDiagramFilterConfig.default.hasOwnProperty(this.diagramViewer.json.properties.type)) {
          this.config = cwApi.customLibs.PsgDiagramFilterConfig.default[this.diagramViewer.json.properties.type];
        } else {
          this.config = null;
        }
      }
    } else {
      this.config = null;
    }

    if (!diagramViewer.isImageDiagram()) {
      this.getRegion(diagramViewer);
      this.createFilterButton(diagramViewer);
    }
  };

  PsgDiagramFilter.prototype.getRegion = function(diagramViewer) {
    var i, entry, objectTypeScriptName, propertyScriptname, paletteEntry, associationRegionEntry, associationRegion;
    this.regionsByObjectType = {};
    for (paletteEntry in diagramViewer.json.diagram.paletteEntries) {
      if (diagramViewer.json.diagram.paletteEntries.hasOwnProperty(paletteEntry)) {
        entry = diagramViewer.json.diagram.paletteEntries[paletteEntry];
        objectTypeScriptName = entry.PaletteObjectTypeScriptName.toLowerCase();
        if (objectTypeScriptName == "eventresult") return;
        if (!this.regionsByObjectType.hasOwnProperty(objectTypeScriptName)) {
          this.regionsByObjectType[objectTypeScriptName] = {};
          this.regionsByObjectType[objectTypeScriptName].paletteEntries = [];
          this.regionsByObjectType[objectTypeScriptName].label = cwAPI.getObjectTypeName(objectTypeScriptName);
        }
      }
    }
  };

  PsgDiagramFilter.prototype.createFilterButton = function(diagramViewer) {
    var filterButton,
      o,
      that = this;
    filterButton = diagramViewer.$breadcrumb.find("a#cw-diagram-filter");
    if (filterButton.length > 0) {
      filterButton.unbind("click");
    } else {
      o = [];
      o.push('<a id="cw-diagram-filter" class="btn btn-diagram-filter no-text" title="', $.i18n.prop("DiagramSearchSearchIcon"), '"><span class="btn-text"></span><i class="fa fa-filter"></i></a>');
      diagramViewer.$breadcrumb.find(".cwDiagramBreadcrumbZoneRight").append(o.join(""));
      filterButton = diagramViewer.$breadcrumb.find(".btn-diagram-filter");
    }

    filterButton.on("click", function() {
      that.setupDiagramFilterZone(diagramViewer);
    });
  };

  PsgDiagramFilter.prototype.setupDiagramFilterZone = function(diagramViewer) {
    var o,
      $div,
      paletteEntry,
      objScriptname,
      objType,
      loadedEntries,
      that = this;
    o = [];
    loadedEntries = [];
    o.push('<div id="cw-diagram-filter-id" class="cw-diagram-search-container"></div>');
    o.push("</div>");
    $div = $(o.join(""));
    cwApi.CwPopout.showPopout(this.title1);
    cwApi.CwPopout.setContent($div);

    this.setupTemplate(diagramViewer);
    cwApi.CwPopout.onClose(function() {
      that.setupSearchParameters(false);
    });
  };

  PsgDiagramFilter.prototype.setupTemplate = function(diagramViewer) {
    let self = this;
    this.hidePropertyGroup();
    this.activateButtonsEvent();

    cwApi.CwAsyncLoader.load("angular", function() {
      let loader = cwApi.CwAngularLoader,
        templatePath,
        $container = $("cw-diagram-filter-id");
      loader.setup();
      templatePath = self.getTemplatePath("cwHtml5DiagramFilter", "cwHtml5DiagramFilter");

      loader.loadControllerWithTemplate("cwHtml5DiagramFilter", $container, templatePath, function($scope, $sce) {
        self.angularScope = $scope;
      });
    });
  };

  PsgDiagramFilter.prototype.setGlobalAlphaRegion = function(diagramViewer, shape, region) {
    if (!cwApi.isUndefinedOrNull(shape) && !cwApi.isUndefinedOrNull(shape.shape) && !cwApi.isUndefinedOrNull(shape.shape.cwObject)) {
      if (!cwApi.isUndefined(this.searchParameters) && this.searchParameters.search === true && this.searchParameters.objectTypeScriptName === shape.shape.cwObject.objectTypeScriptName && this.highlightShape[shape.shape.Sequence] < 2) {
        diagramViewer.ctx.globalAlpha = this.globalAlpha;
      } else {
        diagramViewer.ctx.globalAlpha = 1;
      }
    }
  };

  PsgDiagramFilter.prototype.resetGlobalAlpha = function(diagramViewer) {
    if (!cwApi.isUndefined(this.searchParameters) && this.searchParameters.search === true) {
      diagramViewer.ctx.globalAlpha = this.globalAlpha;
    } else {
      diagramViewer.ctx.globalAlpha = 1;
    }
  };

  cwAPI.Diagrams.CwDiagramViewer.prototype.strokeShape = function(ctx, shape, strokeColor, width) {
    if (ctx !== undefined) {
      ctx.strokeStyle = strokeColor;
      if (width !== undefined) {
        ctx.lineWidth = width; //2
      } else {
        ctx.lineWidth = 1; //2
      }
      var item = shape.getItem();
      shape.drawSymbolPath(ctx, 100, item);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  };

  PsgDiagramFilter.prototype.setupSearchParameters = function(set) {
    if (set === false) {
      if (cwApi.isUndefined(this.searchParameters)) {
        this.searchParameters = {};
      }
      this.searchParameters.search = false;
      return undefined;
    }

    var i, params, canSearch, inputField, inputValue, selectedOt, at;
    canSearch = true;
    selectedOt = $("select#" + this.diagramViewer.id + "-options-select").val();
    params = {};
    params.properties = {};
    params.associations = {};
    if (this.diagramOptions.hasOwnProperty(selectedOt)) {
      for (i = 0; i < this.diagramOptions[selectedOt].properties.length; i += 1) {
        inputField = $("#" + this.diagramViewer.id + "-options-property-" + this.diagramOptions[selectedOt].properties[i]);
        if (inputField.attr("type") === "checkbox") {
          inputValue = inputField.is(":checked");
        } else {
          inputValue = inputField.val();
        }
        params.properties[this.diagramOptions[selectedOt].properties[i]] = inputValue;
      }
      for (at in this.diagramOptions[selectedOt].associations) {
        if (this.diagramOptions[selectedOt].associations.hasOwnProperty(at)) {
          inputField = $("#" + this.diagramViewer.id + "-options-association-" + at);
          inputValue = inputField.val();
          params.associations[at] = inputValue;
        }
      }
    }
    this.searchParameters = params;
    this.searchParameters.objectTypeScriptName = selectedOt;
    this.searchParameters.date = $("#" + this.diagramViewer.id + "_" + selectedOt + "_date").val();

    if (selectedOt !== "0") {
      this.searchParameters.search = canSearch;
    } else {
      this.searchParameters.search = false;
    }
  };

  PsgDiagramFilter.prototype.matchSearchCriteria = function(item) {
    var itemPropertyValue,
      searchValue,
      property,
      propertyScriptname,
      at,
      associatedItem,
      atScriptName,
      step,
      b = true,
      i;
    if (item.objectTypeScriptName !== this.searchParameters.objectTypeScriptName) {
      return false;
    }
    for (propertyScriptname in this.searchParameters.properties) {
      if (this.searchParameters.properties.hasOwnProperty(propertyScriptname)) {
        property = cwApi.mm.getProperty(item.objectTypeScriptName, propertyScriptname);
        searchValue = this.searchParameters.properties[propertyScriptname];
        itemPropertyValue = item.properties[propertyScriptname];
        if (property) {
          if (property.type === "Lookup" || property.type === "FixedLookup") {
            if (searchValue !== undefined && searchValue !== "-1" && (item.properties[propertyScriptname + "_id"] === undefined || item.properties[propertyScriptname + "_id"].toString() !== searchValue)) {
              return false;
            }
          } else if (property.type === "Boolean") {
            if (searchValue !== undefined && searchValue !== "0" && searchValue !== "-1" && (itemPropertyValue === undefined || itemPropertyValue.toString().toLowerCase() != searchValue.toLowerCase())) {
              return false;
            }
          } else {
            if (
              searchValue !== undefined &&
              searchValue !== "" &&
              itemPropertyValue &&
              itemPropertyValue
                .toString()
                .toLowerCase()
                .indexOf(searchValue.toLowerCase()) === -1
            ) {
              return false;
            }
          }
        }
      }
    }
    for (at in this.searchParameters.associations) {
      if (this.searchParameters.associations.hasOwnProperty(at)) {
        if (this.searchParameters.associations[at] != 0 && this.searchParameters.associations[at] !== undefined) {
          b = false;
          for (atScriptName in item.associations) {
            if (item.associations.hasOwnProperty(atScriptName)) {
              if (atScriptName.indexOf(at.toLowerCase()) !== -1) {
                for (i = 0; i < item.associations[atScriptName].length; i += 1) {
                  if (item.associations[atScriptName][i].object_id == this.searchParameters.associations[at]) {
                    b = true;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (b === false) return b;

    if (this.config && this.config[this.searchParameters.objectTypeScriptName + "_date"]) {
      for (var s in this.config[this.searchParameters.objectTypeScriptName + "_date"]) {
        if (this.config[this.searchParameters.objectTypeScriptName + "_date"].hasOwnProperty(s)) {
          step = this.config[this.searchParameters.objectTypeScriptName + "_date"][s];
          if (this.isObjectInStep(item.properties, step, this.searchParameters.date)) {
            return true;
          }
        }
      }
    }
    return true;
  };

  PsgDiagramFilter.prototype.register = function() {};

  if (!cwApi.customLibs) {
    cwApi.customLibs = {};
  }
  if (!cwApi.customLibs.PsgDiagramFilter) {
    cwApi.customLibs.PsgDiagramFilter = PsgDiagramFilter;
  }
})(cwAPI, jQuery);
