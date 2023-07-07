import Filter from "sap/ui/model/Filter";
import Object from "sap/ui/base/Object";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Sorter from "sap/ui/model/Sorter";

export interface ServicesEntity {
    [key: string]: string|number|unknown
    AdditionalCategories: string
    Category: string
    Icon: string
    Id: string
    Name: string
    ShortDesc: string
    ServicePlan: string
    ServicePlanName: string
    Infrastructure: string
    Platform: string
    Region: string
  }
export interface EntitySet<T> {
    '@odata.context':string
    value:Array<T>
}

/**
 * @namespace recap.capadvancedprogrammingmodel.btpservices.service
 */
export default class BTPServiceService extends Object{
    private model: ODataModel;
    constructor(model: ODataModel) {
        super();
        this.model = model;
    }
    public async getBTPServices(): Promise<EntitySet<ServicesEntity>> {
        const templateBinding = this.model.bindContext(`/Services`);
        return await templateBinding.requestObject() as EntitySet<ServicesEntity>;
    }
}