public class PurchaseLineHandler {
    public static void updatePurchaseTotals(Set<Id> purchaseIds) {
        Map<Id, AggregateResult> aggregatedData = new Map<Id, AggregateResult>();

        for (AggregateResult ar : [
                SELECT Purchase__c purchaseId,
                        SUM(UnitCost__c * Amount__c) totalSum,
                SUM(Amount__c) totalItems
                FROM PurchaseLine__c
                WHERE PurchaseId__c IN :purchaseIds
                GROUP BY PurchaseId__c
        ]) {
            aggregatedData.put((Id) ar.get('purchaseId'), ar);
        }

        List<Purchase__c> purchasesToUpdate = new List<Purchase__c>();

        for (Id purchaseId : purchaseIds) {
            AggregateResult ar = aggregatedData.get(purchaseId);
            if (ar != null) {
                purchasesToUpdate.add(new Purchase__c(
                        Id = purchaseId,
                        GrandTotal__c = (Decimal) ar.get('totalSum'),
                        TotalItems__c = (Integer) ar.get('totalItems')
                ));
            }
        }

        if (!purchasesToUpdate.isEmpty()) {
            update purchasesToUpdate;
        }
    }
}
