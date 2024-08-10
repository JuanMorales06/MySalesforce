import { LightningElement, wire, track } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text', sortable: true },
    { label: 'Email', fieldName: 'Email', type: 'email', sortable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
    { label: 'Mobile Phone', fieldName: 'MobilePhone', type: 'phone', sortable: true }
];

export default class ContactList extends LightningElement {
    @track columns = COLUMNS;
    @track contacts = [];
    @track filteredContacts = [];
    @track page = 1;
    @track pageSize = 10; 
    @track totalRecords;
    contacts;
    error;
    @track sortedBy = 'Name'; 
    @track sortDirection = 'ASC';
    searchKey = '';
    @track isLoading = false;
    

    @wire(getContacts, { pageNumber: '$page', pageSize: '$pageSize', sortBy: '$sortedBy', sortDirection: '$sortDirection' })
    wiredContacts(result) {
        this.isLoading = true;
        if (result.data) {
            this.contacts = result.data.records;
            this.totalRecords = result.data.total;
            this.filteredContacts = [...this.contacts];
            this.error = undefined;
            this.isLoading = false;
        } else if (result.error) {
            this.error = this.reduceErrors(result.error);
            this.contacts = [];
            this.filteredContacts = [];
            this.isLoading = false;
        }
    }


    handleSearch(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.applyFilter();
    }

    applyFilter() {
        if (this.searchKey) {
            this.filteredContacts = this.contacts.filter(contact => 
                contact.Name.toLowerCase().includes(this.searchKey)
            );
        } else {
            this.filteredContacts = [...this.contacts];
        }
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortDirection = sortDirection;
    }

    reduceErrors(errors) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }
        return errors
            .filter(error => !!error)
            .map(error => {
                if (Array.isArray(error.body)) {
                    return error.body.map(e => e.message).join(', ');
                } else if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                }
                return error.message || 'Unknown error';
            })
            .join(', ');
    }

    updateButtonStates() {
        this.isPrevDisabled = this.page <= 1;
        this.isNextDisabled = this.page >= Math.ceil(this.totalRecords / this.pageSize);
    }

    handlePreviousPage() {
        if (this.page > 1) {
            this.page--;
            this.updateButtonStates();
        }
    }

    handleNextPage() {
        if (this.page < Math.ceil(this.totalRecords / this.pageSize)) {
            this.page++;
            this.updateButtonStates();
        }
    }
}
