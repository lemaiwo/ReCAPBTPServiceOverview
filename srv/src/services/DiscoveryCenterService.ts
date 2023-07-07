
import { IDiscoveryCenterEntity, IDiscoveryCenterServiceEntity } from '../types/DiscoveryCenterService';
import BaseService from './BaseService';

export default class DiscoveryCenterService extends BaseService {

    private readonly entityName: string = "Services";
    private readonly entityNameDetails: string = "GetServicesDetails";
    
    constructor() {
        super("DISCOVERY_CENTER_API");
    }

    public async getServices(): Promise<Array<IDiscoveryCenterEntity>> {
        return (await this.cdsService.get(`/${this.entityName}`) as unknown as Array<IDiscoveryCenterEntity>);
    }

    public async getServiceDetails(id: string): Promise<IDiscoveryCenterServiceEntity> {
        const serviceDetails = (await this.cdsService.get(`/${this.entityNameDetails}?serviceId='${id}'`) as unknown as { GetServicesDetails: string });
        return JSON.parse(serviceDetails.GetServicesDetails) as IDiscoveryCenterServiceEntity;
    }
    
    public async getAllServiceDetails(services: Array<IDiscoveryCenterEntity>) {
        const chunkSize = 20;
        let serviceDetailsResult: IDiscoveryCenterServiceEntity[] = [];
        for (let i = 0; i < services.length; i += chunkSize) {
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));
            const chunkServices = services.slice(i, i + chunkSize);
            let serviceDetailsPromises: Promise<IDiscoveryCenterServiceEntity>[] = [];
            for (const service of chunkServices) {
                serviceDetailsPromises.push(this.getServiceDetails(service.Id));
            }
            const responses = await Promise.all(serviceDetailsPromises);
            serviceDetailsResult = [...serviceDetailsResult, ...responses];
        }
        return serviceDetailsResult;
    }


}