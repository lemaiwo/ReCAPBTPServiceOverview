"use strict";

sap.ui.define(["../DialogController", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (__DialogController, Filter, FilterOperator) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const DialogController = _interopRequireDefault(__DialogController);
  /**
   * @namespace recap.capadvancedprogrammingmodel.btpservices.controller.dialog
   */
  const CompareServices = DialogController.extend("recap.capadvancedprogrammingmodel.btpservices.controller.dialog.CompareServices", {
    onBeforeShow: function _onBeforeShow(viewController, dialog, resolve, data, popoverSource) {
      this.dialog = dialog;
      this.viewController = viewController;
      this.data = data;
      this.resolve = resolve;
    },
    onSearch: function _onSearch(event) {
      var sValue = event.getParameter("value");
      var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
      var oBinding = event.getParameter("itemsBinding");
      oBinding.filter([oFilter]);
    },
    onClose: function _onClose(event) {
      this.resolve([]);
    },
    onConfirm: function _onConfirm(event) {
      const serviceId = event.getParameter("selectedContexts").map(context => context.getProperty("Id"));
      this.resolve(serviceId);
    }
  });
  return CompareServices;
});