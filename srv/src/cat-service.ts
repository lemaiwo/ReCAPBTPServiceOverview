import cds from '@sap/cds';
import { Service } from "@sap/cds/apis/services";
import EntityFactory from "./EntityFactory";

export = async (srv: Service) => {
    await EntityFactory.getInstance().applyHandlers(srv);
};