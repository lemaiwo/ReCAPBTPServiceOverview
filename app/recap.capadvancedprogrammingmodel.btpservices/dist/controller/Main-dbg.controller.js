"use strict";

sap.ui.define(["./BaseController", "../model/formatter", "sap/m/Text", "sap/ui/table/Column", "sap/ui/export/Spreadsheet", "sap/m/MessageToast", "sap/ui/table/TablePersoController", "./ServicesPersoService", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/layout/VerticalLayout", "sap/tnt/InfoLabel", "sap/ui/core/Fragment"], function (__BaseController, __formatter, Text, Column, Spreadsheet, MessageToast, TablePersoController, __ServicesPersoService, Filter, FilterOperator, VerticalLayout, InfoLabel, Fragment) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseController = _interopRequireDefault(__BaseController);
  const formatter = _interopRequireDefault(__formatter);
  const ServicesPersoService = _interopRequireDefault(__ServicesPersoService);
  /**
   * @namespace recap.capadvancedprogrammingmodel.btpservices.controller
   */
  const Main = BaseController.extend("recap.capadvancedprogrammingmodel.btpservices.controller.Main", {
    constructor: function constructor() {
      BaseController.prototype.constructor.apply(this, arguments);
      this.formatter = formatter;
    },
    onInit: async function _onInit() {
      this.btpServiceState = this.getOwnerComponent().getModel("btp");
      this.btpServiceStateData = this.btpServiceState.getData();
      this.tablePersoController = new TablePersoController({
        table: this.byId("genericTable"),
        persoService: ServicesPersoService,
        showResetAll: false
      });
      await this.showBusyDialog();
      await this.btpServiceState.read();
      this.hideBusyDialog();
    },
    hideBusyDialog: function _hideBusyDialog() {
      this.busyDialog.close();
    },
    showBusyDialog: async function _showBusyDialog() {
      if (!this.busyDialog) {
        this.busyDialog = await Fragment.load({
          name: "recap.capadvancedprogrammingmodel.btpservices.view.dialog.BusyDialog",
          controller: this
        });
        this.getView().addDependent(this.busyDialog);
      }
      this.busyDialog.open();
    },
    createColumns: function _createColumns(id, context) {
      const column = context.getObject();
      const list = new VerticalLayout();
      const infoLabel = new InfoLabel({
        text: `{btp>name}`,
        colorScheme: 6
      });
      list.bindAggregation("content", {
        path: `${column.id}Plans`,
        model: 'btp',
        template: infoLabel,
        templateShareable: true
      });
      return new Column({
        label: column.name,
        width: column.id === "Name" ? "250px" : "auto",
        template: column.id === "Name" ? new Text({
          text: `{btp>${column.id}}`
        }) : list
      });
    },
    onExport: function _onExport() {
      const table = this.byId('genericTable');
      const rowBinding = table.getBinding('rows');
      const cols = this.btpServiceStateData.columns.map(column => ({
        label: column.name,
        property: column.id
      }));
      const settings = {
        workbook: {
          columns: cols
        },
        dataSource: rowBinding
      };
      const sheet = new Spreadsheet(settings);
      sheet.build().then(function () {
        MessageToast.show('Spreadsheet export has finished');
      }).finally(function () {
        sheet.destroy();
      });
    },
    onTablePerso: async function _onTablePerso(event) {
      this.tablePersoController.openDialog({});
    },
    onFilterTableServices: async function _onFilterTableServices(event) {
      const servciceId = await this.openFragment({
        name: "recap.capadvancedprogrammingmodel.btpservices.view.dialog.FilterServices"
      });
      if (servciceId.length > 0) {
        this.byId("genericTable").getBinding("rows").filter(new Filter({
          filters: servciceId.map(id => {
            return new Filter({
              path: "Id",
              operator: FilterOperator.EQ,
              value1: id
            });
          }),
          and: false
        }));
      }
    }
  });
  return Main;
});