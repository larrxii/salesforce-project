trigger PurchaseLineTrigger on PurchaseLine__c (after insert, after update, after delete) {
    Set<Id> purchaseIds = new Set<Id>();

    if (Trigger.isInsert || Trigger.isUpdate) {
        for (PurchaseLine__c pl : Trigger.new) {
            if (pl.Purchase__c != null) {
                purchaseIds.add(pl.Purchase__c);
            }
        }
    }

    if (Trigger.isDelete) {
        for (PurchaseLine__c pl : Trigger.old) {
            if (pl.Purchase__c != null) {
                purchaseIds.add(pl.Purchase__c);
            }
        }
    }

    if (!purchaseIds.isEmpty()) {
        PurchaseLineHandler.updatePurchaseTotals(purchaseIds);
    }
}