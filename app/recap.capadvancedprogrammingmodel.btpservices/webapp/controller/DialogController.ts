import Popover from "sap/m/Popover";
import UI5Element from "sap/ui/core/Element";
import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import BaseController, { frag } from "./BaseController";
/**
 * @namespace recap.capadvancedprogrammingmodel.btpservices.controller
 */
export default abstract class Dialog extends BaseController {
	protected dialog: frag;
	public abstract onBeforeShow(viewController: Controller, dialog: frag, resolve: (value?: unknown) => void, data?: unknown, popoverSource?: Popover): void;
	public fragmentById(viewController: Controller, fragment: string, id: string): UI5Element {
		return sap.ui.getCore().byId(viewController.createId(Fragment.createId(fragment, id)));
	}
}