public with sharing class ItemController {
    @AuraEnabled(cacheable=true)
    public static List<Item__c> getFilteredItems(String searchText, List<String> typeFilters, List<String> familyFilters) {
        String search = '%' + searchText + '%';
        String query = 'SELECT Id, Name, Description__c, Type__c, Family__c, Image__c, Price__c FROM Item__c WHERE (Name LIKE :search OR Description__c LIKE :search)';

        if (typeFilters != null && !typeFilters.isEmpty()) {
            query += ' AND Type__c IN :typeFilters';
        }
        if (familyFilters != null && !familyFilters.isEmpty()) {
            query += ' AND Family__c IN :familyFilters';
        }

        query += ' LIMIT 100';
        return Database.query(query);
    }
}
