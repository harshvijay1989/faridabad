@isTest
public class QuoteToOrderControllerTest {

    @isTest
    static void testConvertQuoteToOrder() {
        // Create a test Account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // Create a test Opportunity
        Opportunity__c testOpportunity = new Opportunity__c(
            Opportunity_Name__c = 'Test Opportunity',
            Stage__c = 'Closed Won',
            Close_Date__c = Date.today(),
            Account_Name__c = testAccount.Id
        );
        insert testOpportunity;

        // Create a test Quote
        Quote__c testQuote = new Quote__c(
            Name = 'Test Quote',
            Status__c = 'Draft',
            Account_Name__c = testAccount.Id,
            Opportunity__c = testOpportunity.Id
        );
        insert testQuote;

        // Call the convertQuoteToOrder method
        Test.startTest();
        Id orderId = QuoteToOrderController.convertQuoteToOrder(testQuote.Id);
        Test.stopTest();

        // Verify that the Order was created
        System.assertNotEquals(null, orderId);
    }
}