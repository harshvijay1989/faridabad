import { LightningElement,api,track ,wire } from 'lwc';
import getTemplate from '@salesforce/apex/ObjectListController.getTemplate';
import getEmailTemplates from '@salesforce/apex/ObjectListController.getEmailTemplates';
import searchEmailTemplates from '@salesforce/apex/ObjectListController.searchEmailTemplates';

const DELAY = 300; // dealy apex callout timing in miliseconds  

export default class CustomerLookupLwc extends LightningElement { 
    @api label = 'custom lookup label';
    
    lstResult = []; // to store list of returned records   
    hasRecords = true; 
   @track searchKey=''; // to store input field value  
   @track isDocOpen = true;  
    isSearchLoading = false; // to control loading spinner  
    delayTimeout;
    selectedRecord = {}; // to store selected lookup record in object formate 
    connectedCallback(){

         getEmailTemplates()
            .then((result) => {
                if(result != null){
                    this.selectedRecord = result;
                    this.handelSelectRecordHelper(); // helper function to show/hide lookup result container on UI
                }
            })
            .catch((error) => {
                this.error = error;
                this.selectedRecord = {};
            });
    }
   // wire function property to fetch search record based on user input
    @wire(searchEmailTemplates, { searchKey: '$searchKey'})
     searchResult(value) {
        const { data, error } = value; // destructure the provisioned value
        this.isSearchLoading = false;
        if (data) {
             this.hasRecords = data.length == 0 ? false : true; 
             this.lstResult = JSON.parse(JSON.stringify(data)); 
         }
        else if (error) {
            console.log('(error---> ' + JSON.stringify(error));
         }
    };
       
    
    handleKeyChange(event) {
        this.isSearchLoading = true;
        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        console.log('searchKey===> '+searchKey);
        this.delayTimeout = setTimeout(() => {
        this.searchKey = searchKey;

         searchEmailTemplates({ searchKey: this.searchKey})
            .then((result) => {
                console.log('result===> ',JSON.stringify(result));
                this.isSearchLoading = false;
                if(result != null){
                    this.hasRecords = result.length == 0 ? false : true; 
                    this.lstResult = JSON.parse(JSON.stringify(result)); 
                }
            })
            .catch((error) => {
                this.error = error;
                this.selectedRecord = {};
            });

        }, DELAY);
    }
    
    toggleResult(event){
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        const clsList = lookupInputContainer.classList;
        const whichEvent = event.target.getAttribute('data-source');
        console.log('whichEvent ===> '+whichEvent);
        switch(whichEvent) {
            case 'searchInputField':
                clsList.add('slds-is-open');
               break;
            case 'lookupContainer':
                clsList.remove('slds-is-open');    
            break;                    
           }
    }
   
   handleRemove(){
    this.searchKey = '';    
    this.selectedRecord = {};
    
    const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
     searchBoxWrapper.classList.remove('slds-hide');
     searchBoxWrapper.classList.add('slds-show');
     const pillDiv = this.template.querySelector('.pillDiv');
     pillDiv.classList.remove('slds-show');
     pillDiv.classList.add('slds-hide');
  }
  
  @track isTrue = false;
  @track ids = '';
handelSelectedTemplate(event){   
     var objId = event.target.getAttribute('data-recid'); // get selected record Id 
     this.selectedRecord = this.lstResult.find(data => data.Id === objId); // find selected record from list 
     console.log('this.selectedRecord===> ',this.selectedRecord);
        this.ids = objId;
        
    
    getTemplate({ searchKey: objId })
      .then((result) => {
      })
      .catch((error) => {
          alert('error');
        this.error = error;
        
      });
  
    
     this.handelSelectRecordHelper(); 
}

handelSelectRecordHelper(){
    this.template.querySelector('.lookupInputContainer').classList.remove('slds-is-open');
     const searchBoxWrapper = this.template.querySelector('.searchBoxWrapper');
     searchBoxWrapper.classList.remove('slds-show');
     searchBoxWrapper.classList.add('slds-hide');
     const pillDiv = this.template.querySelector('.pillDiv');
     pillDiv.classList.remove('slds-hide');
     pillDiv.classList.add('slds-show');     
}

lookupUpdatehandler(){  
    console.log('this.ids==> ',this.ids);  
    const oEvent = new CustomEvent('lookupupdate',{

     detail:{
        detail: false,
        ids: this.ids,
        isDocOpen: this.isDocOpen
    },
    
    });
    this.dispatchEvent(oEvent);
    }




    hideModalBox(){
         this.isModalOpen = false;
        
         this.lookupUpdatehandler();
         
    }
    handelPreview(){
        
        this.isDocOpen = false;
        this.isTrue = true;
        this.lookupUpdatehandler();

        
    }
    
}