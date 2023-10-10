public class orderSucessMailHandler {
 public static void handleInsert(list<Order__c> orderList){
        set<id> orderIdSet  = new set<Id>();
        for(Order__c ord:orderList){
            if(ord.Id!=null){
                orderIdSet.add(ord.Id);
            }
        }
     system.debug(orderIdSet);
        Set<String> emailSet = new Set<String>();
        List<Messaging.SingleEmailMessage> emailMessages = new List<Messaging.SingleEmailMessage>();
        
        for(Order__c orderObj : [select Id,ContractId__c,Name,OrderNumber__c,ContractId__r.CustomerSigned.Email  from Order__c   WHERE Id IN :orderIdSet AND ContractId__r.CustomerSigned.Email != null]){
            emailSet.add(orderObj.ContractId__r.CustomerSigned.Email);
            Messaging.SingleEmailMessage emailMessage = new Messaging.SingleEmailMessage();
            emailMessage.setToAddresses(new String[] {orderObj.ContractId__r.CustomerSigned.Email});
            emailMessage.setSubject('Order Placed Successfully - ' + orderObj.OrderNumber__c);
            String emailBody = '<p>Thank you for placing Order..!!</p>' +
                               '<p>Your order number is: <strong>' + orderObj.OrderNumber__c + '</strong></p>'+
                               '<p>Best regards,<br/>Faridabad Electricals</p>';
            emailMessage.setHtmlBody(emailBody);
            emailMessages.add(emailMessage);
        }
        
        Messaging.sendEmail(emailMessages);
        system.debug('emaiil ids that have to send email'+emailSet);

    }
    
}