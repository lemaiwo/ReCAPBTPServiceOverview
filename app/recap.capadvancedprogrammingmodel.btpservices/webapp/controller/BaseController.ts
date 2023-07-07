import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import AppComponent from "../Component";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Router from "sap/ui/core/routing/Router";
import History from "sap/ui/core/routing/History";
import Dialog from "sap/m/Dialog";
import Popover from "sap/m/Popover";
import UI5Element from "sap/ui/core/Element";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import DialogController from "./DialogController";
import BusyIndicator from "sap/ui/core/BusyIndicator";

export type frag = {
	controller: DialogController;
	fragment: Fragment;
};
type frags = Record<string, frag>;
let _fragments: frags = {};

/**
 * @namespace recap.capadvancedprogrammingmodel.btpservices.controller
 */

export default abstract class BaseController extends Controller {

	/**
	 * Convenience method for accessing the component of the controller's view.
	 * @returns The component of the controller's view
	 */
	public getOwnerComponent(): AppComponent {
		return (super.getOwnerComponent() as AppComponent);
	}

	/**
	 * Convenience method to get the components' router instance.
	 * @returns The router instance
	 */
	public getRouter() : Router {
		return UIComponent.getRouterFor(this);
	}

	/**
	 * Convenience method for getting the i18n resource bundle of the component.
	 * @returns The i18n resource bundle of the component
	 */
	public getResourceBundle(): ResourceBundle | Promise<ResourceBundle> {
		const oModel = this.getOwnerComponent().getModel("i18n") as ResourceModel;
		return oModel.getResourceBundle();
	}

	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @param [sName] The model name
	 * @returns The model instance
	 */
	public getModel(sName?: string) : Model {
		return this.getView().getModel(sName);
	}

	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @param oModel The model instance
	 * @param [sName] The model name
	 * @returns The current base controller instance
	 */
	public setModel(oModel: Model, sName?: string) : BaseController {
		this.getView().setModel(oModel, sName);
		return this;
	}

	/**
	 * Convenience method for triggering the navigation to a specific target.
	 * @public
	 * @param sName Target name
	 * @param [oParameters] Navigation parameters
	 * @param [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
	 */
	public navTo(sName: string, oParameters?: object, bReplace?: boolean) : void {
		this.getRouter().navTo(sName, oParameters, undefined, bReplace);
	}

	/**
	 * Convenience event handler for navigating back.
	 * It there is a history entry we go one step back in the browser history
	 * If not, it will replace the current entry of the browser history with the main route.
	 */
	public onNavBack(): void {
		const sPreviousHash = History.getInstance().getPreviousHash();
		if (sPreviousHash !== undefined) {
			window.history.go(-1);
		} else {
			this.getRouter().navTo("main", {}, undefined, true);
		}
	}

	public getMainView(): View {
		return this.getView() || this.viewController.getView();
	}
	public onExit(): void {
		_fragments = {};
	}

	public async openFragment(config: { name: string; data?: unknown; popoverSource?: Popover }): Promise<unknown> {
		let viewName: string[];
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
			let newController: Controller;
			try {
				newController = (await Controller.create({
					name: controllerPath + config.name
				})) as Controller;
			} catch (error) {
				console.log("Dialog without controller. Just continue with the current controller for the dialog");
				// eslint-disable-next-line
				newController = this;
			}
			const newFragment = (await Fragment.load({
				id: id,
				name: viewPath + config.name,
				controller: newController
			})) as unknown as Fragment;
			_fragments[id] = { controller: newController as DialogController, fragment: newFragment };
			this.getMainView().addDependent(_fragments[id].fragment as unknown as UI5Element);
		}
		const closedPromise = new Promise((resolve, reject) => {
			if (_fragments[id].controller && (_fragments[id].controller as Controller) !== this) {
				if ("onBeforeShow" in _fragments[id].controller) {
					_fragments[id].controller.onBeforeShow(this, _fragments[id], resolve, config.data, config.popoverSource);
				}
			}
		});
		if (config.popoverSource) {
			(_fragments[id].fragment as unknown as Popover).openBy(config.popoverSource, false);
		} else {
			(_fragments[id].fragment as Dialog).open();
		}
		return closedPromise; //_fragments[id].fragment;
	}

	
    public showBusyIndicator(): void {
        return BusyIndicator.show(0);
    }

    public hideBusyIndicator(): void {
        return BusyIndicator.hide();
    }

}
