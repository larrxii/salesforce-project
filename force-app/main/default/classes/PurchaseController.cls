public with sharing class PurchaseController {
    @AuraEnabled
    public static Id checkoutCart(Id accountId, List<PurchaseLineInput> lines) {

        Decimal total = 0;
        Integer totalItems = 0;
        List<PurchaseLine__c> lineRecords = new List<PurchaseLine__c>();

        for (PurchaseLineInput line : lines) {
            total += line.UnitCost * line.Amount;
            totalItems += line.Amount;

            lineRecords.add(new PurchaseLine__c(
                    ItemId__c = line.ItemId,
                    Amount__c = line.Amount,
                    UnitCost__c = line.UnitCost
            ));
        }

        Purchase__c purchase = new Purchase__c(
                ClientId__c = accountId,
                GrandTotal__c = total,
                TotalItems__c = totalItems
        );
        insert purchase;

        for (PurchaseLine__c line : lineRecords) {
            line.Purchase__c = purchase.Id;
        }
        insert lineRecords;

        return purchase.Id;
    }

    public class PurchaseLineInput {
        @AuraEnabled public Id ItemId;
        @AuraEnabled public Integer Amount;
        @AuraEnabled public Decimal UnitCost;
    }
}
