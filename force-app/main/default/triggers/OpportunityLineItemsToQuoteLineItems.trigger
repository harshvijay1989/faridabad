trigger OpportunityLineItemsToQuoteLineItems on Quote__c (after insert) {
    system.debug('line 3');
    List<QuoteLineItem__c> quoteLineItemsToInsert = new List<QuoteLineItem__c>();
    Set<Id> oppIds = New Set<Id>();
    List<Id> quoteIds = New List<Id>();
    for (Quote__c quote : trigger.new) {
        if (quote.Opportunity__c != null) {
            oppIds.add(quote.Opportunity__c);
            quoteIds.add(quote.Id);
        }
    }
    system.debug('line 13'+oppIds);
    system.debug('line 14'+quoteIds);
    list<Opportunity__c> Accountlist = [Select Id,Account_name__c,Account_name__r.BillingAddress,Account_name__r.ShippingAddress  from Opportunity__c];

    
    if (!oppIds.isEmpty()) {
        
        List<Opportunity_Product__c> opportunityLineItems = [SELECT Id, Name, 
                                                             Quantity__c, List_Price__c, 
                                                             OpportunityId__c,TotalPrice__c,Subtotal__c
                                                             FROM Opportunity_Product__c
                                                             WHERE OpportunityId__c = :oppIds];
        system.debug('line 13'+opportunityLineItems);
        for (Opportunity_Product__c opportunityLineItem : opportunityLineItems) {
            system.debug('line 21'+opportunityLineItem);
            
            
            QuoteLineItem__c quoteLineItem = new QuoteLineItem__c(
                Name = opportunityLineItem.Name,
                Quantity__c = opportunityLineItem.Quantity__c,
                ListPrice__c = opportunityLineItem.List_Price__c,
                Subtotal__c = opportunityLineItem.Subtotal__c,
                TotalPrice__c = opportunityLineItem.TotalPrice__c,
                QuoteId__c = quoteIds[0]
            );
            
            quoteLineItemsToInsert.add(quoteLineItem);
            system.debug('line 28'+quoteLineItemsToInsert);
            
        }
        Quote__c quoToUpdate = new Quote__c(
            Id = quoteIds[0],
            Account_Name__c = Accountlist[0].Account_Name__c 
        );
        if(quoToUpdate != null){
            update quoToUpdate;
        } 
    }
    
    insert quoteLineItemsToInsert;
}