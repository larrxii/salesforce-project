import { LightningElement, track } from 'lwc';
import getFilteredItems from '@salesforce/apex/ItemController.getFilteredItems';
import checkoutCart from '@salesforce/apex/PurchaseController.checkoutCart';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';


export default class ItemPurchaseTool extends NavigationMixin(LightningElement) {
    @track items = [];
    @track searchText = '';
    @track selectedTypes = [];
    @track selectedFamilies = [];
    @track cart = [];

    connectedCallback() {
        this.loadItems();
    }

    loadItems() {
        getFilteredItems({
            searchText: this.searchText,
            typeFilters: this.selectedTypes,
            familyFilters: this.selectedFamilies
        })
            .then(result => {
                this.items = result;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    handleSearchChange(event) {
        this.searchText = event.target.value;
        this.loadItems();
    }

    handleTypeFilterChange(event) {
        this.selectedTypes = Array.from(
            this.template.querySelectorAll('input[data-type="type"]:checked')
        ).map(el => el.value);
        this.loadItems();
    }

    handleFamilyFilterChange(event) {
        this.selectedFamilies = Array.from(
            this.template.querySelectorAll('input[data-type="family"]:checked')
        ).map(el => el.value);
        this.loadItems();
    }

    handleAddToCart(event) {
        const itemId = event.target.dataset.id;
        const selectedItem = this.items.find(item => item.Id === itemId);
        const alreadyInCart = this.cart.find(item => item.Id === itemId);
        if (selectedItem && !alreadyInCart) {
            this.cart.push(selectedItem);
            console.log('Added to cart:', selectedItem.Name);
        }
    }

    @track selectedItem;
    @track isModalOpen = false;

    handleViewDetails(event) {
        const itemId = event.target.dataset.id;
        this.selectedItem = this.items.find(item => item.Id === itemId);
        if (this.selectedItem) {
            this.isModalOpen = true;
        }
    }

    handleCloseModal() {
        this.isModalOpen = false;
    }

    @track isCartModalOpen = false;

    get totalPrice() {
        return this.cart.reduce((sum, item) => sum + item.Price__c, 0);
    }

    get disableCheckout() {
        return this.cart.length === 0;
    }

    handleOpenCart() {
        this.isCartModalOpen = true;
    }

    handleCloseCart() {
        this.isCartModalOpen = false;
    }

    handleCheckout() {
        const cartItems = this.cart.map(item => ({
            itemId: item.Id,
            amount: 1,
            unitCost: item.Price__c
        }));

        checkoutCart({ cartItems: cartItems, accountId: this.recordId }) // предполагаем, что recordId — это Account Id
            .then(result => {
                console.log('Purchase created: ', result);
                this.cart = [];
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Purchase created!',
                        variant: 'success'
                    })
                );

                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result,
                        objectApiName: 'Purchase__c',
                        actionName: 'view'
                    }
                });
            })
            .catch(error => {
                console.error('Checkout error:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Checkout error',
                        variant: 'error'
                    })
                );
            });
    }
}

