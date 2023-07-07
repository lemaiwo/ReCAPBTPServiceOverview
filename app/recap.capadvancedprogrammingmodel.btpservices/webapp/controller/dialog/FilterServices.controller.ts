import DialogController from "../DialogController";
import { frag } from "../BaseController";
import Popover from "sap/m/Popover";
import AppController from "../App.controller";
import UI5Event from "sap/ui/base/Event";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Dialog from "sap/m/Dialog";
import Context from "sap/ui/model/Context";

type data = any;
/**
 * @namespace recap.capadvancedprogrammingmodel.btpservices.controller.dialog
 */
export default class CompareServices extends DialogController {
    private data: data;
    private resolve: (value: Array<string>) => void;
    private viewController: AppController;

    public onBeforeShow(viewController: AppController, dialog: frag, resolve: (value: Array<string>) => void, data: data, popoverSource: Popover): void {
        this.dialog = dialog;
        this.viewController = viewController;
        this.data = data;
        this.resolve = resolve;
    }

    public onSearch(event: UI5Event): void {
        var sValue = event.getParameter("value");
        var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
        var oBinding = event.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
    }

    public onClose(event?: UI5Event): void {
        this.resolve([]);
    }

    public onConfirm(event?: UI5Event): void {
        const serviceId: Array<string> = event.getParameter("selectedContexts").map((context: Context) => context.getProperty("Id"));
        this.resolve(serviceId);
    }
}