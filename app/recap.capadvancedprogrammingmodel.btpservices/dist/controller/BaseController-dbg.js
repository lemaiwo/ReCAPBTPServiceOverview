"use strict";

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/ui/core/routing/History", "sap/ui/core/Fragment", "sap/ui/core/BusyIndicator"], function (Controller, UIComponent, History, Fragment, BusyIndicator) {
  let _fragments = {};

  /**
   * @namespace recap.capadvancedprogrammingmodel.btpservices.controller
   */
  const BaseController = Controller.extend("recap.capadvancedprogrammingmodel.btpservices.controller.BaseController", {
    getOwnerComponent: function _getOwnerComponent() {
      return Controller.prototype.getOwnerComponent.call(this);
    },
    getRouter: function _getRouter() {
      return UIComponent.getRouterFor(this);
    },
    getResourceBundle: function _getResourceBundle() {
      const oModel = this.getOwnerComponent().getModel("i18n");
      return oModel.getResourceBundle();
    },
    getModel: function _getModel(sName) {
      return this.getView().getModel(sName);
    },
    setModel: function _setModel(oModel, sName) {
      this.getView().setModel(oModel, sName);
      return this;
    },
    navTo: function _navTo(sName, oParameters, bReplace) {
      this.getRouter().navTo(sName, oParameters, undefined, bReplace);
    },
    onNavBack: function _onNavBack() {
      const sPreviousHash = History.getInstance().getPreviousHash();
      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getRouter().navTo("main", {}, undefined, true);
      }
    },
    getMainView: function _getMainView() {
      return this.getView() || this.viewController.getView();
    },
    onExit: function _onExit() {
      _fragments = {};
    },
    openFragment: async function _openFragment(config) {
      let viewName;
      if (config.name.indexOf(".") > 0) {
        //full path
        viewName = config.name.split(".");
        config.name = config.name.substr(config.name.lastIndexOf(".") + 1);
      } else {
        //current folder
        viewName = this.getMainView().getViewName().split(".");
      }
      viewName.pop();
      const viewPath = viewName.join(".") + ".",
        controllerPath = viewPath.replace("view", "controller"),
        id = this.getMainView().getId() + "--" + config.name;
      if (!_fragments[id]) {
        let newController;
        try {
          newController = await Controller.create({
            name: controllerPath + config.name
          });
        } catch (error) {
          console.log("Dialog without controller. Just continue with the current controller for the dialog");
          // eslint-disable-next-line
          newController = this;
        }
        const newFragment = await Fragment.load({
          id: id,
          name: viewPath + config.name,
          controller: newController
        });
        _fragments[id] = {
          controller: newController,
          fragment: newFragment
        };
        this.getMainView().addDependent(_fragments[id].fragment);
      }
      const closedPromise = new Promise((resolve, reject) => {
        if (_fragments[id].controller && _fragments[id].controller !== this) {
          if ("onBeforeShow" in _fragments[id].controller) {
            _fragments[id].controller.onBeforeShow(this, _fragments[id], resolve, config.data, config.popoverSource);
          }
        }
      });
      if (config.popoverSource) {
        _fragments[id].fragment.openBy(config.popoverSource, false);
      } else {
        _fragments[id].fragment.open();
      }
      return closedPromise; //_fragments[id].fragment;
    },
    showBusyIndicator: function _showBusyIndicator() {
      return BusyIndicator.show(0);
    },
    hideBusyIndicator: function _hideBusyIndicator() {
      return BusyIndicator.hide();
    }
  });
  return BaseController;
});