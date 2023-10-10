import { LightningElement, track, wire,api } from 'lwc';
import getObjectRecords from '@salesforce/apex/ObjectListController.getObjectRecords';
import getEmailTemplates from '@salesforce/apex/ObjectListController.getEmailTemplates';
import sendSelectedIdsToApex from '@salesforce/apex/ObjectListController.fetchEmails';
import { NavigationMixin } from 'lightning/navigation';
import getObjectNames from '@salesforce/apex/ObjectListController.getObjectList';
import getEmailFields from '@salesforce/apex/ObjectListController.getEmailFields';
import fetchDataFromApex from '@salesforce/apex/ObjectListController.fetchDataFromApex';
import singleEmail from '@salesforce/apex/ObjectListController.singleEmail';
import sendEmail from '@salesforce/apex/ObjectListController.sendEmail';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class MassEmail extends LightningElement {
    @api salesforceobj ;
     @api label = 'Email Template Name';
    @api placeholder = 'search...'; 
    @api iconName = 'standard:account';
    @api sObjectApiName = 'Account';
    @api defaultRecordId = '';
    searchTimeout;
    // private properties 
    lstResult = []; // to store list of returned records   
    hasRecords = true; 
    searchKey=''; // to store input field value    
    isSearchLoading = false; // to control loading spinner  
    delayTimeout;
    selectedRecord = {};



    @track isDocOpen = true;
    @track showDataTable = false;
    //@track selectedObject = '';
    @track objectOptions = [];
    @track tableData = [];
    @track selectedRows = [];
    //@track isModalOpen = false;
    @track EmailtemplateModal = false;
    @track selectedEmailTemplate = '';
    @track emailTemplateOptions = [];
    @track selectedEmailField = [];
    @track emailFieldOptions = [];
    @track EnablePicklist = false;
    @track tableColumns =[];
    @track createTemplateModal = false;
    @track showTemplate = false;
    @track selectedModalOption = ''; // Store the selected option
    @track EmailModaloptions = [
        { label: 'Create Template', value: 'createTemplate' },
        { label: 'Select Email Template', value: 'selectEmailTemplate' }
    ];

    handleOptionChange(event) {
        this.selectedModalOption = event.detail.value;
        
        if(this.selectedModalOption == 'createTemplate'){
                this.EmailtemplateModal = false;
                this.createTemplateModal = true;
        }
        else if(this.selectedModalOption == 'selectEmailTemplate'){
            this.EmailtemplateModal = false;
            this.showTemplate = true;
        }
        // You can perform actions based on the selected option here
    }
    

    fetchEmailFields() {
        getEmailFields({ objectApiName: this.selectedObjectName })
            .then((result) => {
                this.tableData ='';
                this.selectedEmailField = [];
                this.showDataTable = false;
                this.EnablePicklist = true;
                this.emailFieldOptions = result.map((emailField) => ({
                    label: emailField,
                    value: emailField,
                }));
            })
            .catch((error) => {
                // Handle error
            });
    }
    
    
    
    // Handle change in selected email field
    handleEmailFieldChange(event) {
        this.selectedEmailField = event.target.value;
        console.log('selectedEmailField',this.selectedEmailField[0]);
        this.tableColumns = this.selectedEmailField.map((field) => {
        return {
            label: field,
            fieldName: field,
            type: 'text',
            sortable: true,
            };
        });
        this.tableColumns.push({
            label: 'Custom Action',
            type: 'button',
            initialWidth: 135, 
            typeAttributes: {
                label: 'Send Email',
                title: 'Send Email',
                name: 'customAction',
                value: 'send_email',
                variant: 'brand', 
                disabled: false, 
            },
        });
    }
    
    handleButtonClick(){
        fetchDataFromApex({ selectedFields: this.selectedEmailField, objectApiName: this.selectedObjectName  })
            .then((result) => {
                this.EnablePicklist = false;
                
                this.showDataTable = true;
            this.tableData = result; 
            })
            .catch((error) => {
            console.error('Error fetching data from Apex: ', error);
            });

    }    

 handleObjectChange() {
        
        this.selectedObject = this.selectedObjectName;//event.detail.value;
        
        this.fetchEmailFields();
        // getObjectRecords({ selectedObject: this.selectedObject })
        //     .then(result => {
        //        
        //         //alert(result);
        //         this.tableData = result;
        //     })
        //     .catch(error => {
        //         //alert(error);
        //         // Handle any errors here
        //         console.error('Error fetching records: ' + error);
        //     });
    }
    @track listOfSingleEmails = [];
    callRowAction(event) {
        

        this.EmailtemplateModal = true;
        
        const recId = event.detail.row.Id; 
        alert(recId);
        const actionName = event.detail.action.name;
        
       
            
            singleEmail({ objName: this.selectedObject , recId: recId })
                .then((result) => {
                    
                    this.listOfSingleEmails.push(result);
                    alert(this.listOfSingleEmails)
                    this.selectedObject = false;
                    this.isModalOpen = true;
                    this.error = undefined;
                })
                .catch((error) => {
                    this.error = error;
                    
                });
            
    }
    
    hideModal() {  
        this.EmailtemplateModal = false;
    }

    hideCreateModalBox(){
        this.selectedModalOption ='';
        this.createTemplateModal = false;
    }

    // create template 
    handleSubjectChange(event){
        this.emailSubject = event.target.value;
        
    }

    handleBodyChange(event){
        this.emailBody = event.target.value;
        
       
    }

    // send Email to single customer 
    handleCreateCustomTemplate(){
        this.createTemplateModal = false;
        sendEmail({ toAddress: this.listOfSingleEmails, subject: this.emailSubject , body:  this.emailBody})
        .then((result) => {
            
            
           // this.contacts = result;
        })
        .catch((error) => {
            this.error = error;
        });
    }

    // send Email to customer 

    handleEmail(){
        //this.selectedObject = true;
        console.log("csncel");
        this.selectedObjectName = '';
        this.selectedSearchResult = '';
        this.searchResults = '';
        sendSelectedIdsToApex({ selectedEmails: this.listOfEmails , templateId: this.ids })
            .then((result) => {
                this.isDocOpen = true;
                this.contacts = result;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.contacts = undefined;
            });
        }





















     @wire(getEmailTemplates)
    emailTemplates({ error, data }) {
        if (data) {
            
            this.emailTemplateOptions  = data.map(template => ({
                label: template.Name,
                value: template.Id
            }));
           // this.emailTemplateOptions  = JSON.stringify(data);
        } else if (error) {
            
        }
    }
    handleTemplateChange(event) {
        this.selectedEmailTemplate = event.detail.value;
    }
   
   
    handleRowAction(event) {
        alert('tata');
        const selectedRows = event.detail.selectedRows;
        const emailList = [];

        for (let i = 0; i < selectedRows.length; i++) {
            const email = selectedRows[i].Email; // Replace 'Email' with the actual API name of the email field in your data
            if (email) {
                emailList.push(email);
            }
        }

    console.log('Selected Emails: ==>>>>', emailList);
    //this.listOfEmails.push(...emailList);
    console.log('List Emails: ==>>>>', this.listOfEmails);
    }
     

   


    openEmailTemplateModal() {
         console.log('open modal');
         
         this.selectedObject = false;
        this.isModalOpen = true;
    }

    @track ids='';
    lookupRecord(event){
        console.log('event.isDocOpen ===> ',event.detail.isDocOpen);
        console.log(event.detail.detail);
         this.isModalOpen = event.detail.detail;
          this.isDocOpen = event.detail.isDocOpen;
         this.ids =event.detail.ids;
         console.log('event.ids ---> '+event.detail.ids);
         //alert(this.isDocOpen);
    }
    get vfPgaeUrl() {
        
        // Construct the URL correctly
        const vfPageBaseUrl = 'https://crmlandingsoftware6-dev-ed--c.develop.vf.force.com/';
        const vfPagePath = '/apex/massEmailVfPage';
        const devConsoleParam = 'core.apexpages.request.devconsole=1';
        return `${vfPageBaseUrl}${vfPagePath}?${devConsoleParam}`;
    }

    

















    picklistOrdered;
    @track searchResults = '';
    @track selectedSearchResult = '';
    @track selectedObjectName;

    @track isShowModal = true;

    showModalBox() {
        this.isShowModal = true;
    }
    hideModalBox() {
        this.selectedObject = true;
        console.log("csncel");
        this.selectedObjectName = '';
        this.selectedSearchResult = '';
        this.searchResults = '';
        console.log("selected result ",this.searchResults);
        
        // Navigate to the list view
        this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Document_Template__c',
                    actionName: 'list'
                },
                state: {
                    filterName: 'Recent'
                },
            });
    }
    get selectedValue() {
        return this.selectedSearchResult ? this.selectedSearchResult.label : null;
    }
    connectedCallback() {
        getObjectNames()
            .then((result) => {
                console.log("connetced ");
                //this.searchResults=null;
                //this.selectedObjectName= "";
                var temp = [];
                for (var i = 0; i < result.length; i++) {
                    temp.push({ label: result[i].label, value: result[i].value });
                }
                this.picklistOrdered = temp;
                this.picklistOrdered = this.picklistOrdered.sort((a, b) => {
                    if (a.label < b.label) {
                        return -1
                    }
                })
            })
    }
    search(event) {
        // Clear any previous timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        const input = event.detail.value.toLowerCase();

        // Set a new timeout to execute the search after a delay (e.g., 500 milliseconds)
        this.searchTimeout = setTimeout(() => {
            const result = this.picklistOrdered.filter((picklistOption) =>
                picklistOption.label.toLowerCase().includes(input)
            );
            this.searchResults = result;
        }, 50); // Adjust the delay time as needed
    }
    // search(event) {
    //     const input = event.detail.value.toLowerCase();
    //     const result = this.picklistOrdered.filter((picklistOption) =>
    //         picklistOption.label.toLowerCase().includes(input)
    //     );
    //     this.searchResults = result;
    // }
    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.selectedObjectName=selectedValue;
        this.selectedSearchResult = this.picklistOrdered.find(
            (picklistOption) => picklistOption.value === selectedValue
        );
       
        this.clearSearchResults();
    }
    clearSearchResults() {
        this.searchResults = null;
        this.handleObjectChange();
    }
    showPicklistOptions() {
        if (!this.searchResults) {
            this.searchResults = this.picklistOrdered;
        }
    }
    handleNextClick() {
        if(this.selectedObjectName=='' || this.selectedObjectName == null || this.selectedObjectName==undefined ){
            const event = new ShowToastEvent({
                message: 'Please Select Object',
                variant: 'Warning',
                mode: 'dismissable'
            });
            this.dispatchEvent(event); 

        }else{
            this.isShowModal=false;
            this.isEditorCmp=true;
        }
        
    }
    
    
}