"use strict";

sap.ui.define(["sap/ui/base/Object"], function (Object) {
  /**
   * @namespace recap.capadvancedprogrammingmodel.btpservices.service
   */
  const BTPServiceService = Object.extend("recap.capadvancedprogrammingmodel.btpservices.service.BTPServiceService", {
    constructor: function _constructor(model) {
      Object.prototype.constructor.call(this);
      this.model = model;
    },
    getBTPServices: async function _getBTPServices() {
      const templateBinding = this.model.bindContext(`/Services`);
      return await templateBinding.requestObject();
    }
  });
  return BTPServiceService;
});