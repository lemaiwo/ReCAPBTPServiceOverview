@impl: './src/cat-service'
service CatalogService {
    @readonly  @cds.persistence.skip
    entity Services {
        Id                   : String;
        Icon                 : String;
        Name                 : String;
        ShortDesc            : String;
        Category             : String;
        AdditionalCategories : String;
        ServicePlan          : String;
        ServicePlanName      : String;
        Platform             : String;
        Infrastructure       : String;
        Region               : String;
    };
}
