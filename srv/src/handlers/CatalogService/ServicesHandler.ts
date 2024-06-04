import BaseHandler from "cds-plugin-handlers/core/BaseHandler";
import DiscoveryCenterService from "../../services/DiscoveryCenterService";
import { IDiscoveryCenterList } from "../../types/DiscoveryCenterService";
import cds, { Service } from "@sap/cds";
import BaseService from "cds-plugin-handlers/core/BaseService";

export default class ServicesHandler extends BaseHandler {

    private discoveryCenterService!: DiscoveryCenterService;
    private cachedDiscoveryCenters: IDiscoveryCenterList;

    constructor(srv: Service) {
        super(srv,[
            { event: 'on', type: 'READ' }
        ]);
        this.cachedDiscoveryCenters = [];
    }

    protected async onRead(req: any,next:any,skip:number,top:number) {
        let discoveryCenterResult: IDiscoveryCenterList = [];
        if (this.cachedDiscoveryCenters.length > 0) {
            discoveryCenterResult = [...this.cachedDiscoveryCenters];
        }
    
        if (discoveryCenterResult.length < 1) {
            cds.spawn({ every: 3600000 }, async (tx) => {
                discoveryCenterResult = await this.getBTPServices();
            })
            if (this.cachedDiscoveryCenters.length === 0) {
                discoveryCenterResult = await this.getBTPServices();
            }
        }
    
        const total = discoveryCenterResult.length;
        if(top<total)discoveryCenterResult.splice(skip, top);
        if (req.query.SELECT.count) discoveryCenterResult['$count'] = total;
        return discoveryCenterResult;
    }
    private async getBTPServices(): Promise<IDiscoveryCenterList> {
        this.discoveryCenterService = await BaseService.getInstance(DiscoveryCenterService);
        let discoveryCenterResult: IDiscoveryCenterList = [];
        let discoveryCenter = await this.discoveryCenterService.getServices();
        const serviceDetailsResult = await this.discoveryCenterService.getAllServiceDetails(discoveryCenter);
    
        for (const service of discoveryCenter) {
            const serviceDetail = serviceDetailsResult.find(serviceDetail => serviceDetail.Id === service.Id);
            if (serviceDetail) {
                for (const servicePlan of serviceDetail.servicePlans) {
                    for (const env of servicePlan.environments) {
                        discoveryCenterResult.push({ ...service, ServicePlan: servicePlan.Code, ServicePlanName: servicePlan.Name, Infrastructure: env.Infrastructure, Platform: env.Platform, Region: env.Region });
                    }
                }
            }
        }
        this.cachedDiscoveryCenters = [...discoveryCenterResult];
        return discoveryCenterResult;
    }
}
