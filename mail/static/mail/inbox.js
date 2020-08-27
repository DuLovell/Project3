document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => {
      // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-page').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    
    // Run the 'compose' function
    compose_email();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  //
  const elements = document.getElementsByClassName("mails");
  while (elements.length > 0) elements[0].remove();




  // Select all input fields from 'compose email' form to be used later
  const recepients = document.querySelector("#compose-recipients");
  const subject = document.querySelector("#compose-subject");
  const body = document.querySelector("#compose-body");
  const submit = document.querySelector("#submit");

  // Disable submit button by default
  submit.disabled = true;

  // Listen for input to be typed into the input field
  body.onkeyup = () => {
    if (body.value.length > 0) {
      submit.disabled = false;
    }
    else {
      submit.disabled = true;
    }
  }

  // Listen for submission of form
  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recepients.value,
        subject: subject.value,
        body: body.value
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    });

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    setTimeout(function() {load_mailbox('sent')}, 700);
    return false;



  }

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-page').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //
  const elements = document.getElementsByClassName("mails");
  while (elements.length > 0) elements[0].remove();

  //
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = "mails";
      
      element.addEventListener('click', () => fetch(`/emails/${email.id}`)
        .then(response => response.json())
        .then(letter => {

          load_letter(letter);
        }));

      if (email.read === true) {
          element.style.border = '1px solid #ced4da';
          element.style.backgroundColor = '#e9eff5';
        }


      if (mailbox === 'sent') {
        element.innerHTML = `To: <span class="address"><b>${email.recipients}</b></span> ${email.subject} <span class="date">${email.timestamp}</span>`;
      }
      else {
        element.innerHTML = `<span class="address"><b>${email.sender}</b></span> ${email.subject} <span class="date">${email.timestamp}</span>`;
      }

      document.getElementById('emails-view').appendChild(element);
    });

  });
  return false;
}


function call_archive(letter) {
  if (letter.archived === false) {
    fetch(`/emails/${letter.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    });
  }
  else {
    fetch(`/emails/${letter.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    });
  }
  setTimeout(function() { load_mailbox('inbox') }, 700);
}

function load_letter(letter) {



  document.querySelector('#email-page').style.display = 'block';
  document.querySelector('#archive').style.display = 'inline-block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  

  if (letter.sender === document.querySelector('h2').innerHTML) {
    document.querySelector('#archive').style.display = 'none';
  }

  if (letter.archived === true) {
    document.querySelector('#archive').innerHTML = 'Unarchive';
  }
  else {
    document.querySelector('#archive').innerHTML = 'Archive';
  }


  document.querySelector('#reply').addEventListener('click', () => {
    document.querySelector('#email-page').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    document.querySelector('#compose-recipients').value = letter.sender;
    document.querySelector('#compose-subject').value = 'Re: ' + letter.subject;
    document.querySelector('#compose-body').value = `On ${letter.timestamp} ${letter.sender} wrote: ${letter.body}\n`;
    document.querySelector('#compose-body').focus();

    compose_email();

  })
  //document.querySelector('#archive').removeEventListener('click', call_archive);

  //document.querySelector('#archive').addEventListener('click', call_archive(letter));
  document.querySelector('#archive').onclick = function(){
    call_archive(letter);
  }
    
    


  fetch(`/emails/${letter.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });



  document.querySelector('#from').innerHTML = `<b>From:</b> ${letter.sender}`
  document.querySelector('#to').innerHTML = `<b>To:</b> ${letter.recipients}`;
  document.querySelector('#subject').innerHTML = `<b>Subject:</b> ${letter.subject}`;
  document.querySelector('#timestamp').innerHTML = `<b>Timestamp:</b> ${letter.timestamp}`;
  document.querySelector('#text').innerHTML = `${letter.body}`;
}