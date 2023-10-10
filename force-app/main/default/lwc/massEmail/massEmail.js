import { LightningElement, track, wire,api } from 'lwc';
import getObjectRecords from '@salesforce/apex/ObjectListController.getObjectRecords';
import getEmailTemplates from '@salesforce/apex/ObjectListController.getEmailTemplates';
import sendSelectedIdsToApex from '@salesforce/apex/ObjectListController.fetchEmails';
import { NavigationMixin } from 'lightning/navigation';
import getObjectNames from '@salesforce/apex/ObjectListController.getObjectList';
import singleEmail from '@salesforce/apex/ObjectListController.singleEmail';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
export default class MassEmail extends LightningElement {

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
    @track selectedObject = '';
    @track objectOptions = [];
    @track tableData = [];
    @track selectedRows = [];
    @track isModalOpen = false;
    @track selectedEmailTemplate = '';
    @track emailTemplateOptions = [];
    @track columns = [
          { type: 'checkbox', label: '', initialWidth: 50, typeAttributes: { rowId: { fieldName: 'Id' }, menuAlignement : 'auto' } },
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Actions',type: 'button',initialWidth: 200,typeAttributes: {
            label: 'Send Email',
            name: 'send_email',
            title: 'Send Email',
            disabled: false,
            value: 'send_email',
            iconPosition: 'left',
        },
    },
    ];
    handleObjectChange() {
        //alert(this.selectedObjectName);
        this.selectedObject = this.selectedObjectName;//event.detail.value;
        getObjectRecords({ selectedObject: this.selectedObject })
            .then(result => {
                //alert(result);
                this.tableData = result;
            })
            .catch(error => {
                //alert(error);
                // Handle any errors here
                console.error('Error fetching records: ' + error);
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
   
    listOfEmails = [];
    handleRowAction(event) {
        const selectedRows = event.detail.selectedRows;
        const emailList = [];

        for (let i = 0; i < selectedRows.length; i++) {
            const email = selectedRows[i].Email; // Replace 'Email' with the actual API name of the email field in your data
            if (email) {
                emailList.push(email);
            }
        }

    console.log('Selected Emails: ==>>>>', emailList);
    this.listOfEmails.push(...emailList);
    console.log('List Emails: ==>>>>', this.listOfEmails);
    }
     

    callRowAction(event) {
        
    const recId = event.detail.row.id; // Use 'Id' instead of 'id'
    
    const actionName = event.detail.action.name;
    
    if (actionName === 'send_email') {
        singleEmail({ objName: this.selectedObject , recId: recId })
            .then((result) => {
                 
                this.listOfEmails.push(result);
                this.selectedObject = false;
                this.isModalOpen = true;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.contacts = undefined;
            });
        }
       
    
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
    
    handleEmail(event){
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
}






















// import { LightningElement,track } from 'lwc';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import sendEmails from '@salesforce/apex/EmailSenderController.sendEmails';
// export default class MassEmail extends LightningElement {
//      @track emailAddresses = '';
//     @track subject = '';
//     @track body = '';

//     handleEmailChange(event) {
//         this.emailAddresses = event.target.value;
//     }

//     handleSubjectChange(event) {
//         this.subject = event.target.value;
//     }

//     handleBodyChange(event) {
//         this.body = event.target.value;
//     }

//     sendEmail() {
//         const emails = this.emailAddresses.split(',');
        
//         // Call the Apex method to send emails
//         sendEmails({ emailAddresses: emails, subject: this.subject, body: this.body })
//             .then(result => {
//                 this.showSuccessToast(result);
//             })
//             .catch(error => {
//                 this.showErrorToast(error);
//             });
//     }

//     showSuccessToast(message) {
//         const toastEvent = new ShowToastEvent({
//             title: 'Success',
//             message: message,
//             variant: 'success',
//         });
//         this.dispatchEvent(toastEvent);
//     }

//     showErrorToast(error) {
//         const toastEvent = new ShowToastEvent({
//             title: 'Error',
//             message: error,
//             variant: 'error',
//         });
//         this.dispatchEvent(toastEvent);
//     }
// }