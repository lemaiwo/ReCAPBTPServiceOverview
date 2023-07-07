export interface IDiscoveryCenter {
    Id: string;
    Icon: string;
    Name: string;
    ShortDesc: string;
    Category: string;
    AdditionalCategories: string;
    ServicePlan: string;
    ServicePlanName: string;
    Infrastructure: string;
    Platform: string;
    Region: string;
}

export interface IDiscoveryCenterEntity {
    Id: string;
    Icon: string;
    Name: string;
    ShortDesc: string;
    Category: string;
    AdditionalCategories: string;
}

export interface IDiscoveryCenterEnvironmentEntity {
    EnvId: string;
    Infrastructure: string;
    Platform: string;
    Region: string;
}

export interface IDiscoveryCenterServicePlanEntity {
    Id: string;
    Code: string;
    Name: string;
    Description: string;
    environments: Array<IDiscoveryCenterEnvironmentEntity>
}

export interface IDiscoveryCenterServiceEntity {
    Id: string;
    Name: string;
    servicePlans: Array<IDiscoveryCenterServicePlanEntity>
}

export type IDiscoveryCenterList = Array<IDiscoveryCenter> & { "$count"?: number };