import {ContactsAPI} from './contactsapi.js'

class AddEditContact {
  static formDataToJson(formData) {
    let json = {};
    for (let pair of formData.entries()) {
      json[pair[0]] = pair[1];
    }
    return json;
  }

  static formatTagsForBackend() {
    let tagsList = document.querySelectorAll('.current_tag_button');
    console.log(tagsList);
    if (tagsList.length > 0) {
      let result = [];
      tagsList.forEach(tag => {
        result.push(tag.innerText)
      });

      return result.join(',');
    } 
    return null;
    // let result = [];
    // tagsList.forEach(tag => {
    //   result.push(tag.innerText)
    // });

    // return result.join(',');
  }

  static getAllTags() {
    let allCurrentTags = document.querySelectorAll('.current_tag_button');
    let allAvailableTags = document.querySelectorAll('.available_tag_button');
    let allTagNodes = [];
    allTagNodes.push.apply(allTagNodes, allCurrentTags);
    allTagNodes.push.apply(allTagNodes, allAvailableTags);
    
    let allTagNames = [];
    allTagNodes.forEach(node => {
      allTagNames.push(node.textContent);
    });
    
    allTagNames = [...new Set(allTagNames)];
    
    return allTagNames;
  }

  static getCurrentContactTags() {
    let allCurrentTags = document.querySelectorAll('.current_tag_button');
    let currentTagNodes = [];
    currentTagNodes.push.apply(currentTagNodes, allCurrentTags);

    let currentTagNames = [];
    allCurrentTags.forEach(node => {
      currentTagNames.push(node.textContent);
    });

    return currentTagNames;
  }

  // populate all current contact's tags
  static setCurrentTags(allTags) {
    if (allTags.length > 0) {
      allTags.forEach(tag => {
        let span = document.createElement('span');
        let newTagButton = document.createElement('button');
        newTagButton.textContent = tag;
        newTagButton.classList.add('current_tag_button');
        span.append(newTagButton);
        $('#current_tags').append(span);
      });
    };
  }

  // populate all available tags
  static getAllAvailableTags() {
    ContactsAPI.get('/api/contacts').done((response) => {
      let allTags = [];
      response.forEach(contact => {
        if (contact.tags) {
          let tags = contact.tags.split(',');
          tags.forEach((tag) => {
            if (!allTags.includes(tag)) {
              allTags.push(tag.trim());
            };
          });
        };
      });
      AddEditContact.setAvailableTags(allTags.sort());
    });
  }

  static setAvailableTags(allTags) {
    let currentContactTags = this.getCurrentContactTags();
    if (allTags.length > 0) {
      allTags.forEach(tag => {
        if (!currentContactTags.includes(tag)) {
          let span = document.createElement('span');
          let newTagButton = document.createElement('button');
          newTagButton.textContent = tag;
          newTagButton.classList.add('available_tag_button');
          span.append(newTagButton);
          $('#available_tags').append(span);
          }
      });
    };
  }

  // form validation
  static addFormValidation() {
    let errorMessages = {
      full_name: " Please enter a valid first and last name.",
      email: " Please enter a valid email (e.g. someone@example.com)",
      phone_number: " Please enter a valid phone number in the following format: 111-222-3333",
      tags: " If adding more than one tag please separate each with a comma (e.g. work, sales)",
    }

    let allInputs = $('#new_contact input');

    allInputs.each((_, node) => {
      let errorMessage = document.createElement('span');
      let nodeId = $(node)[0].id
      $(node).on('focusout', () => {
        if ($(node)[0].validity.valid) {
           if ($(node)[0].id !== 'new_tag') {
            $(node)[0].style.borderColor = 'green';
            $(node).parent()[0].style.color = 'green';
            errorMessage.style.display = 'none';
           }
        } else {
          $(node)[0].style.borderColor = 'red';
          $(node).parent()[0].style.color = 'red';
          errorMessage.textContent = errorMessages[nodeId];
          $(node).after(errorMessage);
        }
      });
    });
  }
}

export {AddEditContact}