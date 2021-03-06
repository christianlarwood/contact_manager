import {ContactsAPI} from './contactsapi.js'
import {AddEditContact} from './addeditcontact.js'
import {HideShowElementsMixin} from './hideshowelementsmixin.js'

class ContactApp {
  constructor() {
    this.templates = {};
    this.createTemplates();
    this.registerPartial();
    this.renderContacts();
    this.bindEvents();
  }

  createTemplates() {
    $('[type="text/x-handlebars"]').each((_, template) => {
      this.templates[$(template).attr('id')] = Handlebars.compile($(template).html())
    });
  }

  registerPartial() {
    Handlebars.registerPartial('contact', $('[data-type="partial"]').html());
  }

  bindEvents() {
    $(document).on('click', '#add_contact', this.renderAddContact.bind(this));
    $(document).on('click', '#add_tag_button', this.addTag.bind(this));
    $(document).on('click', '.current_tag_button', this.removeTag.bind(this));
    $(document).on('click', '.available_tag_button', this.addAvailableTag.bind(this));
    $(document).on('click', '#add_new_contact_button', this.addContact.bind(this));
    $(document).on('click', '#cancel', this.cancelAddContact.bind(this));
    $(document).on('click', '#edit', this.renderEditContact.bind(this));
    $(document).on('click', '#update_contact', this.updateContact.bind(this));
    $(document).on('click', '#delete', this.deleteContact.bind(this));
    $('#search').on('input', this.valueChanged.bind(this));
    $(document).on('click', '.contact_tag_button', this.renderSameTagContacts.bind(this));
    $(document).on('click', '#show_all_contacts', this.renderContacts.bind(this));
  }

  renderAddContact() {
    this.hideContactsContainer();
    this.hideNoContactsContainer();
    this.hideHeader();
    this.displayAddContactContainer();

    $('#add_contact_container').html(this.templates.createContactTemplate());
    AddEditContact.addFormValidation();
    AddEditContact.getAllAvailableTags();
  }

  addTag(event) {
    event.preventDefault();
    let newTag = $('#new_tag').val();
    let allTags = AddEditContact.getAllTags();
    
    if (allTags.includes(newTag)) {
      alert('You cannot add a tag that already exists!')
    } else if (newTag.length > 0) {
      let span = document.createElement('span');
      let newTagButton = document.createElement('button');
      newTagButton.textContent = newTag;
      newTagButton.classList.add('current_tag_button');
      span.append(newTagButton);
      $('#current_tags').append(span);
      $('#new_tag')[0].value = '';
    } else {
      alert('Your tag must be at least 1 character long.')
    }
  }

  removeTag(event) {
    event.preventDefault();

    $('#current_tags').each((_, node) => {
      $(node).on('click', '.current_tag_button', (event) => {
        event.preventDefault();
        event.target.closest('span').remove();
      });
    });
  }

  addAvailableTag(event) {
    event.preventDefault();
    event.target.classList.remove('available_tag_button');
    event.target.classList.add('current_tag_button');
    $('#current_tags').append(event.target.closest('span'));
  }

  addContact(event) {
    event.preventDefault();

    let form = document.querySelector('form');
    let data = new FormData(form);
    let json = AddEditContact.formDataToJson(data);
    json.tags = AddEditContact.formatTagsForBackend();
    console.log(json);
    ContactsAPI.post('/api/contacts/', json).done((response) => {
      alert('Successfully added contact.');

      // hide the add_contact element and show all contacts
      this.hideAddContactContainer();
      this.renderContacts();
    }).fail((response) => {
      alert('To add a new contact, you must fill in all required fields.')
    });
  }

  cancelAddContact(event) {
    event.preventDefault();
    this.renderContacts();
  }

  renderEditContact(event) {
    event.preventDefault();
    
    this.hideContactsContainer();
    this.hideNoContactsContainer();
    this.hideHeader();
    this.displayEditContactContainer();

    let contactId = $(event.target).attr('data-contact-id'); 
  
    ContactsAPI.get('/api/contacts/' + contactId).done((response) => {
      response.tags = response.tags.split(',').sort();
      $('#edit_contact_container').html(this.templates.createContactTemplate(response));
      AddEditContact.addFormValidation();
      AddEditContact.getAllAvailableTags();

      // change the default form submit button to "Update Contact"
      let updateContactButton = document.createElement('button');
      updateContactButton.setAttribute('id', 'update_contact');
      updateContactButton.textContent = 'Update Contact';
      $('#add_new_contact_button').replaceWith(updateContactButton);
    });
  }

  updateContact(event) {
    event.preventDefault();

    let form = document.querySelector('form');
    let data = new FormData(form);
    let json = AddEditContact.formDataToJson(data);
    json.tags = AddEditContact.formatTagsForBackend();

    let element = $('[name="full_name"]');
    let contactId = $(element).attr('data-contact-id');
    json.id = Number(contactId);

    ContactsAPI.update('/api/contacts/' + contactId, json).done((response) => {
      alert('Successfully updated the contact.')
      this.hideEditContactContainer();
      this.renderContacts();
    });
  }

  deleteContact(event) {
    event.preventDefault();
    this.displayDeleteConfirmationModal();
    let contactName = $(event.target).parent().find('h3')[0].textContent;
    let modalSpan = $('#modal_contact_name');
    let contactId = $(event.target).attr('data-contact-id');
    
    // set contact name on modal
    $(modalSpan)[0].textContent = contactName;

    // delete contact when use clicks "Yes"
    let yesButton = $('#yes');
    yesButton.on('click', () => {
      this.hideDeleteConfirmationModal();
      let url = `/api/contacts/${contactId}`;

      ContactsAPI.delete(url).done((response) => {
        alert('Successfully removed the contact.')
        this.renderContacts();
      });
    });

    // when user clicks "No" or 'X' close the modal
    let noButton = $('#no');
    let closeButton = $('.close');

    noButton.on('click', () => {
      this.hideDeleteConfirmationModal();
    });

    closeButton.on('click', () => {
      this.hideDeleteConfirmationModal();
    });
  }

  renderContacts(event) {
    ContactsAPI.get('/api/contacts').done((response) => {
      if (response.length === 0) {
        this.displayNoContactsContainer();
        this.displayHeader();
        this.hideContactsContainer();
        this.hideAddContactContainer();
        this.hideEditContactContainer();
      } else {
        this.hideNoContactsContainer();
        this.hideAddContactContainer();
        this.hideEditContactContainer();
        this.displayContactsContainer();
        this.displayHeader();
    
        // format each contact's tags into an array for Handlebars template
        response.forEach(contact => {
          if (contact.tags) {
            if (contact.tags.length > 0) {
              contact.tags = contact.tags.split(',').sort();
            }
          }
        });
  
        $('#contacts_container').html(this.templates.contactsTemplate({ contacts: response }));
      }
    });
  }

  // search functionality
  valueChanged() {
    let searchValue = $('#search').val();
    if (searchValue.length > 0) {
      this.renderSearchContacts(searchValue)
    } else if (searchValue.length === 0) {
      $('#contacts_container')[0].style.display = "block";
      this.renderContacts();
    }
  }

  renderSearchContacts(searchValue) {
    ContactsAPI.get('/api/contacts').done((response) => {
      let filteredContacts = response.filter(contact => {
        let regex = new RegExp(searchValue, 'gi')
        if (contact.full_name.match(regex) || contact.email.match(regex) || contact.phone_number.match(regex) || contact.tags !== null && contact.tags.match(regex)) {
          return true;
        } else {
          return false;
        }
      });
      
      if (filteredContacts.length === 0) {
        $('#no_contacts_text')[0].innerHTML = `You have no matching contacts with the following information: <strong>${searchValue}</strong>`;
        this.displayNoContactsContainer();
        this.hideContactsContainer();
      } else {
        this.hideNoContactsContainer();
        this.displayContactsContainer();
        filteredContacts.forEach(contact => {
          if (contact.tags) {
            if (contact.tags.length > 0) {
              contact.tags = contact.tags.split(',').sort();
            }
          }
        });
        $('#contacts_container').html(this.templates.contactsTemplate({ contacts: filteredContacts }));
      }
    });
  }

  renderSameTagContacts(event) {
    event.preventDefault();
    let tagName = event.target.textContent;

    ContactsAPI.get('/api/contacts').done((response) => {
      let filteredContacts = response.filter(contact => {
        let regex = new RegExp(tagName, 'gi')
        if (contact.tags !== null && contact.tags.match(regex)) {
          return true;
        } else {
          return false;
        }
      });
      
      this.hideNoContactsContainer();
      this.displayContactsContainer();
      
      filteredContacts.forEach(contact => {
        if (contact.tags) {
          if (contact.tags.length > 0) {
            contact.tags = contact.tags.split(',').sort();
          }
        }
      });

      $('#contacts_container').html(this.templates.contactsTemplate({ contacts: filteredContacts }));
    });
  }
}


$(function() {
  new ContactApp;
  Object.assign(ContactApp.prototype, HideShowElementsMixin);
});