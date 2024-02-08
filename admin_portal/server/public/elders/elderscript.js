


document.addEventListener('DOMContentLoaded', function() {
  var modal = document.getElementById("editModal");
  var span = document.getElementsByClassName("close")[0];

  span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
});

function toggleForm(){
  let togglebutton = document.getElementById("formToggler");
  let form = document.getElementById("newUserForm");
  if(form.style.display == "none"){
      form.style.display = "block"
      togglebutton.classList = "btn-danger";
      togglebutton.innerHTML = " X "
  }else{
      form.style.display = "none"
      togglebutton.classList = "btn-primary";
      togglebutton.innerHTML = "New Caregiver"
  }
  console.log("tryckte knapp");
}

fetch('/elderDB')
      .then(response => response.json())
      .then(data => {
        let tableRows = data.map(elder => 
          `<tr id="${elder.username}">
            <td>${elder.username}</td>
            <td>${elder.name}</td>
            <td>${elder.contact}</td>
            <td>${elder.preferences}</td>
            <td>${elder.birthday}</td>
            <td>${elder.address}</td>
            <td>${elder.pin}</td>
            <td>${elder.language}</td>
            <td><button class="btn btn-primary" onclick="editData(this)">✏️</button></td>
            <td><button class="btn btn-danger" onclick="deleteUser(this)" >🗑️</button></td>
          </tr>`
        ).join('');
        document.getElementById('elderTable').innerHTML += tableRows;
        console.log("added data from mongodb");
      });

function deleteUser(btn){
  var user = btn.parentNode.parentNode.id;
  var delete_confirmed = confirm("Are you sure you want to DELETE the user: " + user);
  var data = {username: user};
  console.log("data:", data)
  if(delete_confirmed){
    //skicka att vi ska ta bort
    fetch('/deleteElder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(() => {
      location.reload();
    });
  }else{
    console.log("cancelled");
  }
}

function editData(btn){
  
  var user = btn.parentNode.parentNode.id;
  var modal = document.getElementById("editModal");
  var form = document.getElementById("editForm");
  var previous_username = document.getElementById(user).children[0].innerText;
  //skriv in de nuvarande värdena
  prefillEditInput(user);
  
  modal.style.display = "block";

  form.onsubmit = function(e) {
    //så att vi inte byter sida dirket
    e.preventDefault();
    
    var formData = {
      current_username: previous_username,
      username: document.getElementById("edit_username").value,
      contact: document.getElementById("edit_contact").value,
      birthday: document.getElementById("edit_birthday").value,
      name: document.getElementById("edit_name").value,
      preferences: document.getElementById("edit_preferences").value,
      language: document.getElementById("edit_language").value,
      pin: document.getElementById("edit_pin").value,
      address: document.getElementById("edit_address").value,
    };
    //kolla om vi ändrat på lösenordet öht
    if(document.getElementById("edit_password").value != "") {
      formData.password = document.getElementById("edit_password").value
    }

    fetch('/updateElder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }).then(() => {
      location.reload();
    });
    // Hide the modal
    modal.style.display = "none";
  }
}

function prefillEditInput(user){
  var usernameindex = 0, nameindex = 1, contactindex = 2, preferencesindex = 3, birthdayindex = 4, addressindex = 5, pinindex = 6, languageindex = 7;
  var row = document.getElementById(user);
  document.getElementById("edit_username").value = row.children[usernameindex].innerText;
  document.getElementById("edit_password").value = ""; //Denna SKALL vara tom (admin skall ej kunna se lösenord)
  document.getElementById("edit_name").value = row.children[nameindex].innerText;
  document.getElementById("edit_preferences").value = row.children[preferencesindex].innerText;
  document.getElementById("edit_contact").value = row.children[contactindex].innerText;
  document.getElementById("edit_birthday").value = formatDate(row.children[birthdayindex].innerText);
  document.getElementById("edit_address").value = row.children[addressindex].innerText;
  document.getElementById("edit_pin").value = row.children[pinindex].innerText;
  document.getElementById("edit_language").value = row.children[languageindex].innerText;
}


//gör om datumsträng till ett date som vi kan slänga in i en form!
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


