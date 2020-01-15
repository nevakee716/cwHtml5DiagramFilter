/*jslint browser:true*/
/*global cwAPI, jQuery, cwTabManager*/
(function(cwApi, $) {
  "use strict";

  var PsgDiagramFilter;

  var bannedObjectTypeScriptName = ["EVENRESULT", "PROCESSBREAK", "CONNECTORSET", "FREETEXTOBJECT", "CONNECTOR"];
  var regionToDisplay = [2, 3, 4, 18];

  PsgDiagramFilter = function(diagramViewer) {
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    function rgb2hex(rgb) {
      rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+\.*\d+)?\)$/);
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    this.configuration = {};
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
    o.push('<div id="cw-diagram-filter-id" class="cw-diagram-filter-container"></div>');
    $div = $(o.join(""));
    cwApi.CwPopout.showPopout(this.title1);
    cwApi.CwPopout.setContent($div);

    this.setupTemplate(diagramViewer);
    cwApi.CwPopout.onClose(function() {
      that.setupSearchParameters(false);
    });
  };

  PsgDiagramFilter.prototype.getTemplatePath = function(folder, templateName) {
    return cwApi.format("{0}/html/{1}/{2}.ng.html", cwApi.getCommonContentPath(), folder, templateName) + "?" + Math.random();
  };

  PsgDiagramFilter.prototype.filtersObjects = function(objects, filterArray) {
    var self = this,
      filteredObjects = [];
    objects.forEach(function(object) {
      if (
        filterArray.length === 0 ||
        filterArray.every(function(filter) {
          return self.matchPropertyFilter(object, filter);
        })
      ) {
        filteredObjects.push(object);
      }
    });

    return filteredObjects;
  };

  PsgDiagramFilter.prototype.matchPropertyFilter = function(object, filter) {
    if (filter.scriptname && filter.Operator && filter.Value) {
      let propertyType = cwApi.mm.getProperty(object.objectTypeScriptName, filter.scriptname);
      let objPropertyValue;
      let propertyScriptname = filter.scriptname.toLowerCase();
      let value = filter.Value;
      if (propertyScriptname === "id") {
        // changing id to make usable like other property
        objPropertyValue = object.object_id;
      } else {
        if (propertyType.type === "Lookup") {
          objPropertyValue = object.properties[propertyScriptname + "_id"];
        } else if (propertyType.type === "Date") {
          objPropertyValue = new Date(object.properties[propertyScriptname]);
          objPropertyValue = objPropertyValue.getTime();
          let d = filter.Value;
          if (d.indexOf("{@currentDate}") !== -1) {
            d = d.split("-");
            let dateOffset = 24 * 60 * 60 * 1000 * parseInt(d[1]);
            let today = new Date();
            value = today.getTime() - dateOffset;
          } else {
            d = new Date(d);
            value = d.getTime();
          }
        } else {
          objPropertyValue = object.properties[propertyScriptname];
        }
      }

      switch (filter.Operator) {
        case "=":
          return objPropertyValue == value;
        case "<":
          return objPropertyValue < value;
        case ">":
          return objPropertyValue > value;
        case "!=":
          return objPropertyValue != value;
        case "In":
          return value.indexOf(objPropertyValue) !== -1;
        default:
          return false;
      }
      return false;
    } else {
      return true;
    }
  };

  PsgDiagramFilter.prototype.isRegionToDisplay = function(shape, region) {
    let config = this.configuration[shape.shape.cwObject.objectTypeScriptName.toUpperCase()];
    if (config === undefined || config.empty) return true;
    config = config.regions[region.RegionSequence];
    if (config === undefined) return true;
    if (config.enable === false) return false;
    if (region.RegionTypeString !== "MultiplePropertyAssociations") return true;
    let objects = shape.shape.cwObject.associations[region.RegionData.Key];
    let filteredObjects = this.filtersObjects(objects, config.filters);
    return filteredObjects.length > 0;
  };

  PsgDiagramFilter.prototype.isRegionTypeToDisplay = function(region) {
    return regionToDisplay.indexOf(region.RegionType) !== -1;
  };

  PsgDiagramFilter.prototype.getConfiguration = function(diagramViewer) {
    var self = this;
    let paletteEntrySortByObjectType = {};
    Object.keys(diagramViewer.objectTypesStyles).forEach(function(key) {
      let paletteEntry = diagramViewer.objectTypesStyles[key];
      let objectTypeScriptName = key.split("|")[0];
      if (paletteEntrySortByObjectType[objectTypeScriptName] === undefined) paletteEntrySortByObjectType[objectTypeScriptName] = [];
      paletteEntrySortByObjectType[objectTypeScriptName].push(paletteEntry);
      if (self.configuration[objectTypeScriptName] === undefined) {
        self.configuration[objectTypeScriptName] = {};
        self.configuration[objectTypeScriptName].expended = true;
        self.configuration[objectTypeScriptName].regions = {};
      }
      self.configuration[objectTypeScriptName].empty = true;
      paletteEntry.Regions.forEach(function(r) {
        if (self.isRegionTypeToDisplay(r)) self.configuration[objectTypeScriptName].empty = false;
        self.configuration[objectTypeScriptName].regions[r.RegionSequence] = {};
        self.configuration[objectTypeScriptName].regions[r.RegionSequence].expended = false;
        self.configuration[objectTypeScriptName].regions[r.RegionSequence].filters = [];
      });
    });

    return paletteEntrySortByObjectType;
  };

  PsgDiagramFilter.prototype.setupTemplate = function(diagramViewer) {
    let self = this;
    cwApi.CwAsyncLoader.load("angular", function() {
      let loader = cwApi.CwAngularLoader,
        templatePath,
        $container = $("#cw-diagram-filter-id");
      loader.setup();

      templatePath = self.getTemplatePath("cwHtml5DiagramFilter", "cwHtml5DiagramFilter");
      loader.loadControllerWithTemplate("cwHtml5DiagramFilter", $container, templatePath, function($scope, $sce) {
        self.angularScope = $scope;
        $scope.diagramViewer = diagramViewer;
        $scope.getObjectType = cwApi.mm.getObjectType;
        $scope.getPropertyType = cwApi.mm.getProperty;
        $scope.isRegionToDisplay = self.isRegionToDisplay;
        $scope.configuration = self.configuration;
        $scope.isObjectTypeToDisplay = function(objectTypeScriptName) {
          return bannedObjectTypeScriptName.indexOf(objectTypeScriptName) === -1 && self.configuration[objectTypeScriptName].empty !== true;
        };

        $scope.paletteEntrySortByObjectType = self.getConfiguration(diagramViewer);
        $scope.FilterOperators = ["=", "!=", ">", "<"];

        $scope.processFilter = function(filter) {
          delete filter.Value;
          delete filter.Operator;
        };
        $scope.getFilterOperator = function(objectTypeScriptName, scriptname) {
          let type = $scope.getPropertyDataType(objectTypeScriptName, scriptname);
          switch (type) {
            case "checkbox":
              return ["=", "!="];
            case "Integer":
            case "number":
              return ["=", "!=", ">", "<"];
            case "date":
              return ["=", "!=", ">", "<"];
            case "lookup":
              return ["=", "!="];
            default:
              return ["=", "!="];
          }
        };

        $scope.getPropertyDataType = function(objectTypeScriptName, scriptname) {
          if (cwApi.isUndefined(objectTypeScriptName)) {
            return "";
          }
          if (scriptname) {
            var p = cwApi.mm.getProperty(objectTypeScriptName, scriptname);
            if (cwApi.isUndefined(p)) {
              return "";
            }
            switch (p.type) {
              case "Boolean":
                return "checkbox";
              case "Integer":
              case "Double":
                return "number";
              case "Date":
                return "date";
              case "Lookup":
                return "lookup";
              default:
                return "text";
            }
          } else return "number";
        };
      });
    });
  };

  PsgDiagramFilter.prototype.setGlobalAlphaRegion = function(shape, region) {
    if (!cwApi.isUndefinedOrNull(shape) && !cwApi.isUndefinedOrNull(shape.shape) && !cwApi.isUndefinedOrNull(shape.shape.cwObject)) {
      if (this.isRegionToDisplay(shape, region)) {
        this.diagramViewer.ctx.globalAlpha = 1;
      } else {
        this.diagramViewer.ctx.globalAlpha = this.globalAlpha;
      }
    }
  };

  PsgDiagramFilter.prototype.resetGlobalAlpha = function(diagramViewer) {
    this.diagramViewer.ctx.globalAlpha = 1;
  };

  PsgDiagramFilter.prototype.register = function() {};

  if (!cwApi.customLibs) {
    cwApi.customLibs = {};
  }
  if (!cwApi.customLibs.PsgDiagramFilter) {
    cwApi.customLibs.PsgDiagramFilter = PsgDiagramFilter;
  }
})(cwAPI, jQuery);
