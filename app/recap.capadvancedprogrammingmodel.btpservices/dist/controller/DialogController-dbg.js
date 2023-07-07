"use strict";

sap.ui.define(["sap/ui/core/Fragment", "./BaseController"], function (Fragment, __BaseController) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseController = _interopRequireDefault(__BaseController);
  /**
   * @namespace recap.capadvancedprogrammingmodel.btpservices.controller
   */
  const Dialog = BaseController.extend("recap.capadvancedprogrammingmodel.btpservices.controller.Dialog", {
    fragmentById: function _fragmentById(viewController, fragment, id) {
      return sap.ui.getCore().byId(viewController.createId(Fragment.createId(fragment, id)));
    }
  });
  return Dialog;
});