// OpportunityQuotesController.cls
public with sharing class OpportunityQuotesController {

    @AuraEnabled(cacheable=true)
    public static List<Quote__c> getRelatedQuotes(Id opportunityId) {
        try {
            system.debug('opportunityId==> '+ opportunityId);
            List<Quote__c> quotes = [SELECT Id, Name, ExpirationDate__c, Status__c,	QuoteNumber__c FROM Quote__c WHERE Opportunity__c = :opportunityId ORDER BY CreatedDate DESC LIMIT 1];
            system.debug('quotes==> '+ quotes);
            return quotes;
        } catch (Exception e) {
            System.debug('Error fetching related quotes: ' + e.getMessage());
            throw e;
        }
    }
}