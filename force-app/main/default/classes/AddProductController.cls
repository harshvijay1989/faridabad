public without sharing class AddProductController {
    @AuraEnabled
    public static String findProducts(String recordId, String name, String productCode, List<String> productFamily, Integer RecordLimit) {
      system.debug('recordId'+recordId);
       
         wrapperClass wc = new wrapperClass();
        
        String ProductQuery = 'SELECT Id, Family__c, Description__c, ProductCode__c, Name, Unit_price__c FROM Product__c ';
        if (productFamily != null && productFamily.size() != 0) {
            ProductQuery += 'WHERE Family IN :productFamily';
        }
        
        List<Product__c> productList = Database.query(ProductQuery);
        List<ProductWrapper> lstProduct = new List<ProductWrapper>();
        
        for (Product__c p2 : productList) {
            if (name != '' && !p2.Name.containsIgnoreCase(name.trim())) {
                continue;
            }
            if (productCode != '' && !p2.ProductCode__c.containsIgnoreCase(productCode.trim())) {
                continue;
            }
            
            ProductWrapper pw = new ProductWrapper();
            pw.Id = p2.Id;
            pw.purl = '/lightning/r/' + p2.Id + '/view';
            pw.Name = p2.Name;
            pw.Family = p2.Family__c;
            pw.ProductCode = p2.ProductCode__c;
            pw.Description = p2.Description__c;
            pw.Price = p2.Unit_Price__c;
            
            lstProduct.add(pw);
            
            if (lstProduct.size() >= RecordLimit) {
                break;
            }
        }
        
        wc.productList = lstProduct;
        return JSON.serialize(wc);
    }

    @AuraEnabled
    public static List<PicklistValue> getproductfamily() {
        String strObjectName = 'Product__c';
        String strPicklistField = 'Family__c';
        Map<String, String> mapPickListValues = new Map<String, String>();
        Schema.SObjectType objSobjectType = Schema.getGlobalDescribe().get(strObjectName);
        Schema.DescribeSObjectResult objDescribeSobject = objSobjectType.getDescribe();
        Map<String, Schema.SObjectField> mapFields = objDescribeSobject.fields.getMap();
        List<Schema.PicklistEntry> lstPickListValues = mapFields.get(strPicklistField).getDescribe().getPickListValues();
        List<PicklistValue> pvList = new List<PicklistValue>();
        for (Schema.PicklistEntry objPickList : lstPickListValues) {
            PicklistValue pv = new PicklistValue(objPickList.getValue(), objPickList.getLabel());
            pvList.add(pv);
        }
        return pvList;
    }

    @AuraEnabled
    public static String saveProducts(String recordData, String recId) {
        system.debug('Line 63'+recId);
        system.debug('line 64'+recordData);
        List<ProductWrapper> wc = (List<ProductWrapper>) JSON.deserialize(recordData, List<ProductWrapper>.class);
        List<Opportunity_Product__c> lstOpp = new List<Opportunity_Product__c>();
        double totalAmount =0;
        for (ProductWrapper pw : wc) {
            System.debug(' pw' + pw);
            Opportunity_Product__c oli = new Opportunity_Product__c();
            oli.Name = pw.Name;
            oli.Product__c = pw.Id; 
            oli.Quantity__c = pw.Quantity;
            oli.Sales_Price__c = pw.Price;
            oli.Product_Code__c = pw.ProductCode;
            oli.Discount__c = pw.PDate;
            oli.Line_Description__c = pw.LineDescription;
            oli.OpportunityId__c = recId;
             lstOpp.add(oli);
        }
        
        system.debug('totalAmount'+totalAmount);
        Opportunity__c opp = new Opportunity__c();
            opp.Id = recId;
            
            
        
        try {
            insert lstOpp;
            return 'success';
        } catch (Exception e) {
            System.debug(e.getMessage());
            return 'error';
        }
    }

    public with sharing class wrapperClass {
        public List<ProductWrapper> productList;
    }

    public with sharing class ProductWrapper {
        public String Name;
        public String Id;
        public String purl;
        public String Product2Id;
        public String ProductCode;
        public Decimal Price;
        public Decimal Quantity ;
        public integer Discount;
        public String Family;
        public Integer PDate;
        public String Description;
        public String LineDescription;
      
    }

    public class PicklistValue {
        @AuraEnabled
        public String label { get; set; }
        @AuraEnabled
        public String value { get; set; }

        public PicklistValue(String value, String label) {
            this.value = value;
            this.label = label;
        }
    }
}