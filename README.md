# Business Technology Platform Services Overview

This application provides a matrix of all the SAP Business Tehchnology Platform Services **(services, regions, plans)**.
<br/><br/>
### **- Running the application -**
To run the application, execute the following commands
<pre><code><b>npm i</b> (in root and both app dirs)
<b>npm run build</b> (in recap.capadvancedprogrammingmodel.btpservices dir)
<b>npm run demo</b> (in root dir)
</pre></code>

If the application won't start, make sure that the **"uri"** property of the datasource in the manifest.json file of the **'recap.capadvancedprogrammingmodel.btpservices'** application starts and ends with a **/**.<br/><br/>

### **- reCAP code snippet -**
During reCAP 2023 event the following code snippet will be used during the live presentation **CAP Advanced Programming model**.
<br/><br/>

**DiscoveryCenterService.ts**

_**Attributes** and **constructor**:_
```
private readonly entityName: string = "Services";
private readonly entityNameDetails: string = "GetServicesDetails";

constructor() {
    super("DISCOVERY_CENTER_API");
}
```

_**getServices** method:_
```
public async getServices(): Promise<Array<IDiscoveryCenterEntity>> {
    return (await this.cdsService.get(`/${this.entityName}`) as unknown as Array<IDiscoveryCenterEntity>);
}
```

_**getServiceDetails** method:_
```
public async getServiceDetails(id: string): Promise<IDiscoveryCenterServiceEntity> {
    const serviceDetails = (await this.cdsService.get(`/${this.entityNameDetails}?serviceId='${id}'`) as unknown as { GetServicesDetails: string });
    return JSON.parse(serviceDetails.GetServicesDetails) as IDiscoveryCenterServiceEntity;
}
```


_**getAllServiceDetails** method:_
```
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
```
<br/><br/>
**ServicesHandler.ts**


_**Attributes** and **constructor**:_
```
private discoveryCenterService!: DiscoveryCenterService;
private cachedDiscoveryCenters: IDiscoveryCenterList;

constructor() {
    super([
        { event: 'on', type: 'READ' }
    ]);
    this.cachedDiscoveryCenters = [];
}
```

_**getBTPServices** method:_
```
private async getBTPServices(): Promise<IDiscoveryCenterList> {
    this.discoveryCenterService = await this.getService(DiscoveryCenterService);
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
    this.cachedDiscoveryCenters = discoveryCenterResult;
    return discoveryCenterResult;
}
```

_**onRead** method:_
```
protected async onRead(req: any) {
    let discoveryCenterResult: IDiscoveryCenterList = [];
    if (this.cachedDiscoveryCenters.length > 0) {
        console.log("return from cache")
        discoveryCenterResult = structuredClone(this.cachedDiscoveryCenters);
    }

    const skip = req?.query?.SELECT?.limit?.offset?.val;
    const rows = req?.query?.SELECT?.limit?.rows?.val;

    if (discoveryCenterResult.length < 1) {
        cds.spawn({ every: 3600000 }, async (tx) => {
            console.log("fetched again after 1h")
            discoveryCenterResult = await this.getBTPServices();
        })
        if (this.cachedDiscoveryCenters.length === 0) {
            discoveryCenterResult = await this.getBTPServices();
        }
    }

    const total = discoveryCenterResult.length;
    discoveryCenterResult.splice(skip, rows);
    if (req.query.SELECT.count) discoveryCenterResult['$count'] = total;
    return discoveryCenterResult;
}
```