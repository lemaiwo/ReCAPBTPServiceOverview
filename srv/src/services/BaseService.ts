import cds from '@sap/cds';
import { Service } from "@sap/cds/apis/services";

export default abstract class BaseService {
    private static service: { [key: string]: BaseService } = {};
    private static cdsServices: { [key: string]: Service } = {};
    protected serviceName: string;
    protected cdsService!: Service;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    public async connect() {
        if (BaseService.cdsServices[this.serviceName]) {
            this.cdsService = BaseService.cdsServices[this.serviceName];
        } else {
            this.cdsService = await cds.connect.to(this.serviceName);
            BaseService.cdsServices[this.serviceName] = this.cdsService;
        }
        return this.cdsService;
    }

    public getService(): Service {
        return this.cdsService;
    }

    public static async getInstance<T extends BaseService>(service: { new(): T; }): Promise<T> {
        const newService = new service();
        if (BaseService.service[service.name]) return BaseService.service[service.name] as T;
        BaseService.service[service.name] = newService;
        await BaseService.service[service.name].connect();
        return BaseService.service[service.name] as T;
    }
}