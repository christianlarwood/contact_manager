const HideShowElementsMixin = {
  displayHeader() {
    $('#search_container')[0].style.display = "block";
  },

  hideHeader() {
    $('#search_container')[0].style.display = "none";
  },

  displayContactsContainer() {
    $('#contacts_container')[0].style.display = "flex";
  },

  hideContactsContainer() {
    $('#contacts_container')[0].style.display = "none";
  },

  displayEditContactContainer() {
    $('#edit_contact')[0].style.display = "block";
  },

  hideEditContactContainer() {
    $('#edit_contact')[0].style.display = "none";
  },

  displayAddContactContainer() {
    $('#add_new_contact')[0].style.display = "block";
  },

  hideAddContactContainer() {
    $('#add_new_contact')[0].style.display = "none";
  },

  displayNoContactsContainer() {
    $('#no_contacts_container')[0].style.display = "block";
  },

  hideNoContactsContainer() {
    $('#no_contacts_container')[0].style.display = "none";
  },

  displayDeleteConfirmationModal() {
    let modal = document.getElementById('delete_modal');
    modal.style.display = 'block';
  },

  hideDeleteConfirmationModal() {
    let modal = document.getElementById('delete_modal');
    modal.style.display = 'none';
  },
}

export {HideShowElementsMixin}