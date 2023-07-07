import BaseHandler from "./handlers/BaseHandler";
import { camelize } from "./utils/Formatter";
import { EventHandler, Events, OnEventHandler, Request, ResultsHandler, Service, Target } from "@sap/cds/apis/services";
import { Definition, Definitions } from "@sap/cds/apis/reflect";
import path from 'path';
import fs from 'fs';

const operationsDir = "operations";
const startDir = "./";
const handlerDir = "handlers";
const afterOperations = ["afterCreate", "afterRead", "afterUpdate", "afterDelete"];
const skipFolders = ["app", "node_modules", ".git", "resources"];

type OmitSupportedOperationsType = keyof Omit<BaseHandler, "getSupportedOperations">;
type WithoutBaseSufixType<T> = T extends `${infer P}Base` ? P : never;
type SupportedOperationFnType = WithoutBaseSufixType<OmitSupportedOperationsType>;

interface DefinitionWithActions extends Definition {
    actions?: Definitions & ((namespace: string) => Definitions),
    includes: Array<string>
}

export default class EntityFactory {
    private handlers: Record<string, Record<string, BaseHandler>> = {};
    private operations: Record<string, Record<string, OnEventHandler>> = {};
    private entityOperations: Record<string, Record<string, Record<string, OnEventHandler>>> = {};

    private static instance: EntityFactory;

    constructor() {
        this.build();
    }

    private build() {
        for (const file of this.getAllFiles(startDir)) {
            const folderName = path.basename(path.dirname(file));
            let fileName = path.basename(file, path.extname(file));

            if (folderName === handlerDir) continue;

            const imp = require(path.resolve(startDir, file));

            if(!imp.default) continue;

            if (folderName === operationsDir) {
                const serviceName = path.parse(file).dir.split("/").splice(-2)[0];

                let entityName;
                const split = fileName.split(".");

                if (split.length > 1) {
                    entityName = split[0];
                    fileName = split[1];
                }

                if (!entityName) {
                    if (!this.operations[serviceName]) this.operations[serviceName] = {};
                    this.operations[serviceName][fileName] = imp.default;
                    continue;
                }

                if (!this.entityOperations[serviceName]) this.entityOperations[serviceName] = {};
                if (!this.entityOperations[serviceName][entityName]) this.entityOperations[serviceName][entityName] = {};
                this.entityOperations[serviceName][entityName][fileName] = imp.default;

                continue;
            }

            if (!this.handlers[folderName]) this.handlers[folderName] = {};
            this.handlers[folderName][fileName] = new imp.default();
        }
        return this;
    }

    public static getInstance(): EntityFactory {
        if (!EntityFactory.instance) {
            EntityFactory.instance = new EntityFactory();
        }

        return EntityFactory.instance;
    }

    private getAllFiles(dir: any): Array<string>{
        const files: Array<string> = [];

        this.getFiles(dir, files);

        return files;
    }

    private getFiles(dir: string, files: Array<string>) {
        fs.readdirSync(dir).forEach(file => {
            const abs = path.join(dir, file);
            if (fs.statSync(abs).isDirectory() && !skipFolders.includes(abs)) return this.getFiles(abs, files);
            if (abs.includes(`${handlerDir}`)) return files.push(abs);
        });
    }

    public getHandlerInstanceService(Service: string, Entity: string): BaseHandler | undefined {
        return this.handlers[Service] ? this.handlers[Service][`${Entity}Handler`] : undefined;
    }

    public getOperationInstance(Service: string, Operation: string): OnEventHandler | undefined {
        return this.operations[Service]?.[Operation];
    }

    public getEntityOperationInstance(Service: string, Entity: string, Operation: string): OnEventHandler | undefined {
        return this.entityOperations[Service]?.[Entity]?.[Operation];
    }

    public async applyHandlers(srv: Service) {
        await Promise.all([this.applyServiceEntityHandlers(srv), this.applyServiceUnboundOperationHandlers(srv)]);
    }

    private async applyServiceEntityHandlers(srv: Service) {
        for (const entity of Object.keys(srv.entities)) {
            const handlerInstanceService = this.getHandlerInstanceService(srv.name, entity);
            const oEntity = srv.entities[entity] as DefinitionWithActions;

            if (oEntity.actions) this.applyServiceBoundOperationHandlers(srv, entity, oEntity.actions);

            if (!handlerInstanceService) continue;

            for (const supportedOperation of handlerInstanceService?.getSupportedOperations()) {
                const supportedOnReadOperationFn = camelize(`${supportedOperation.event} ${supportedOperation.type}`) as SupportedOperationFnType;
                
                (srv[supportedOperation.event] as (eve: Events, entity: Target, handler: OnEventHandler | EventHandler | ResultsHandler) => Service)
                    (supportedOperation.type, entity,
                        afterOperations.includes(supportedOnReadOperationFn) ?
                            (each: any, req: Request) => handlerInstanceService[`${supportedOnReadOperationFn}Base`]?.(each, req) :
                            (req: Request, next: any) => handlerInstanceService[`${supportedOnReadOperationFn}Base`]?.(req, next));
            }
        }
    }

    private async applyServiceUnboundOperationHandlers(srv: Service) {
        for (const operation of Object.keys(srv.operations)) {
            const operationInstance = this.getOperationInstance(srv.name, operation);
            if (!operationInstance) continue;

            srv.on(operation, operationInstance);
        }
    }

    private async applyServiceBoundOperationHandlers(srv: Service, entity: string, actions: Definitions & ((namespace: string) => Definitions)) {
        for (const operation of Object.keys(actions)) {
            const operationInstance = this.getEntityOperationInstance(srv.name, entity, operation);
            if (!operationInstance) continue;

            srv.on(operation, entity, operationInstance);
        }
    }
}