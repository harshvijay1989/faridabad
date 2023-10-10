public class SendMail {
    @AuraEnabled(cacheable=true)
    public static String sendEmailWithPDF(String recordId) {
        Quote__c quoteRecord = [SELECT Id, Name,Opportunity__r.Primary_contact__r.Email FROM Quote__c WHERE Id = :recordId LIMIT 1];
        try {
            // Generate PDF using Visualforce page
            PageReference pageRef = Page.customQuotePDF;
            pageRef.getParameters().put('id', recordId);
            Blob pdfBlob = pageRef.getContentAsPDF();
            
            // Create an email message
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setSubject('Quote PDF');
            email.setPlainTextBody('Please find the attached quote PDF.');
            
            // Attach the PDF blob to the email
            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
            attachment.setFileName('Quote.pdf');
            attachment.setBody(pdfBlob);
            email.setFileAttachments(new Messaging.EmailFileAttachment[]{attachment});
            
            // Set recipient email address
            email.setToAddresses(new List<String>{quoteRecord.Opportunity__r.Primary_contact__r.Email});// Add recipient email address
            
            
            //  Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
            
            return 'Email sent successfully';
        } catch (Exception e) {
            // Handle exceptions here
            return 'Error sending email: ' + e.getMessage();
        }
    }
    @AuraEnabled
    public static String sendInvoicesWithPdf(String recordId){
        try {
            // Generate PDF using Visualforce page
            PageReference pageRef = Page.customInvoicePDF;
            pageRef.getParameters().put('id', recordId);
            Blob pdfBlob = pageRef.getContentAsPDF();
            
            order__c orderRecord = [SELECT Id, ContractId__c, Name, OrderNumber__c, ContractId__r.CustomerSigned.Email FROM Order__c WHERE Id =: recordId AND ContractId__r.CustomerSigned.Email != null LIMIT 1];
            
            if (orderRecord != null && orderRecord.ContractId__r.CustomerSigned.Email != null) {
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(new List<String>{orderRecord.ContractId__r.CustomerSigned.Email});
                email.setSubject('Order Invoice');
                email.setPlainTextBody('Please find the attached invoice PDF.');
                Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
                attachment.setFileName('Invoices.pdf');
                attachment.setBody(pdfBlob);
                email.setFileAttachments(new Messaging.EmailFileAttachment[]{attachment});
                Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
                return 'Email sent successfully';
            } else {
                return 'Email id is null';
            }
        } catch (Exception e) {
            return 'Error sending email: ' + e.getMessage();
        }
    }
}