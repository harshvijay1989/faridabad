// ConvertQuoteToOrderButton.js
import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import convertQuoteToOrder from '@salesforce/apex/QuoteToOrderController.convertQuoteToOrder';

export default class ConvertQuoteToOrderButton extends NavigationMixin(LightningElement) {
    @api recordId;

    convertToOrder() {
        console.log('this.recordId===>', this.recordId);
        convertQuoteToOrder({ quoteId: this.recordId })
            .then(result => {
                console.log('Quote converted to order successfully:', result);

                // Use NavigationMixin to navigate to the newly created Order record
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,  // Assuming your Apex method returns the Id of the newly created Order
                        actionName: 'view',
                    },
                });

            })
            .catch(error => {
                console.error('Error converting quote to order:', error);
            });
    }
}