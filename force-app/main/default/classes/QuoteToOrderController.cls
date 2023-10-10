// QuoteToOrderController.cls
public with sharing class QuoteToOrderController {
    @AuraEnabled
    public static Id convertQuoteToOrder(Id quoteId) {
        try {
            System.debug('quoteId==> ' + quoteId);
            
            Quote__c quoteRecord = [SELECT Id, Name,Primary__c, Status__c, ContractId__c, Account_Name__c FROM Quote__c WHERE Id = :quoteId LIMIT 1];
            System.debug('quoteRecord==> ' + quoteRecord);
            
            Order__c newOrder = new Order__c(
                AccountId__c = quoteRecord.Account_Name__c, 
                EffectiveDate__c = Date.today(), 
                ContractId__c = '8005j000000QGiVAAW',//quoteRecord.ContractId__c, 
                Name = quoteRecord.Name,
                Status__c = 'Draft'
            );
            
            System.debug('newOrder==> ' + newOrder);
            if(newOrder != null ){
                insert newOrder;
            }
            // Return the ID of the newly created Order
            return newOrder.Id;
        } catch (Exception e) {
            System.debug('Error converting quote to order: ' + e.getMessage());
            throw e;
        }
    }
    
    
    
}