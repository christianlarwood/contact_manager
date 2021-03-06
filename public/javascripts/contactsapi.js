class ContactsAPI {
  static get(url) {
    return $.ajax({
      url,
      type: 'GET',
    });
  }

  static get(url) {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.send();
  }

  static post(url, data) {
    return $.ajax({
      url,
      data,
      type: 'POST',
    });
  }

  static update(url, data) {
    return $.ajax({
      url,
      data,
      type: 'PUT',
    });
  }

  static delete(url) {
    return $.ajax({
      url,
      type: 'DELETE',
    });
  }
}

export {ContactsAPI}