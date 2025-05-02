import { LightningElement, track } from 'lwc';
import getFilteredItems from '@salesforce/apex/ItemController.getFilteredItems';

export default class ItemPurchaseTool extends LightningElement {
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
        const selectedItem = this.items.find(item=>item.Id === itemId);
        if(selectedItem){
            this.cart.push(selectedItem);
            console.log('Added to cart: ', selectedItem.Name);
        }
    }
}

