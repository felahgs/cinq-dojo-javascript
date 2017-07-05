require([
	'dojo/dom',
	'dojo/_base/declare',
	'dojo/dom-construct',
	'dojo/request',
	'dijit/form/Button',
	'dijit/form/Form',
	'dijit/form/ValidationTextBox',
	'dijit/Dialog',
	'dstore/LocalDB',
	'dgrid/OnDemandGrid',
	'dgrid/Selection',
	// 'dojo/domReady!'
], function (dom, declare, domConstruct, request, Button, Form, ValidationTextBox, Dialog, LocalDB, OnDemandGrid, Selection) {
	 var dbConfig = {
	version: 3,
	stores: {
	  contacts: {
		id: { 
		  idProperty: true,
		  autoincrement: true,
		  preference: 100
		 },
		name: { preference: 5 },
		username: { preference: 5 },
		email: { preference: 100 }

	  }
	}
  };

/*-------------------------------------------------------------*/
  // Create Store //
  var contactsStore = new LocalDB({
	dbConfig: dbConfig, 
	storeName: 'contacts'
  });

  request('https://jsonplaceholder.typicode.com/users', {
	handleAs: 'json'
	}).then(function(result) {
	  result.forEach(obj => {
		  contactsStore.put(obj)
	  });
  });
/*-------------------------------------------------------------*/
   // Create an instance of OnDemandGrid referencing the store
	 var grid = new (declare([ OnDemandGrid, Selection ]))({
		collection: contactsStore,
		selectionMode: 'single',
		allowTextSelection: false,
		columns: [{
		  field: 'id',
		  label: 'ID'
		}, {
		  field: 'name',
		  label: 'Name'
		}, {
		  field: 'username',
		  label: 'User'
		}, {
		  field: 'email',
		  label: 'Email'
		}]
	}, 'grid');
	 // contactsStore.add({name: 'Howard Doe',username: 'Doe' ,email: 'jd@mail.com'});
	grid.startup();
	grid.domNode.style.height = '200px';



	contactsStore.get(1).then(function(person){
	  console.log(person.name+" email address is "+person.email);
	})

/*-------------------------------------------------------------*/
  // Get next ID to be added
  
  function getNextId(){
	var next_id = 1;
	grid.collection.forEach(function(person){
		  if (person.id >= next_id){
				console.log("next_id:", next_id);
				next_id = person.id;
		  }
	});
	console.log("Retornando ID:",next_id + 1);
  }

  // getNextId();

/*-------------------------------------------------------------*/  
  // Select Grid Row

  // Return the ID of the selected row in the contact list
  function selectedRow(){
		for (var id in grid.selection) {
			if (grid.selection[id]) {
			  return Number(id);
			}
		}
  }

  // Event used to select the row in dgrid
  grid.on('dgrid-select', function (event) {
	  // Get the rows that were just selected
	  var rows = event.rows;
  });
  
/*-------------------------------------------------------------*/
 //Add User 

	// Add user to the indexDB
	function addUser(id, name, user, email) {
	   console.log ('adduser function');
	   contactsStore.add({id: id, name: name, username: user, email: email});
	}

  // Generate form to make the inclusion
	var form = new Form({
	  encType: 'multipart/form-data',
	  action: '',
	  method: '',
	  onSubmit: function(event){
			if(this.validate()) {
			   var name = document.getElementById("name_form").value;
			   var user = document.getElementById("user_name_form").value;
			   var email = document.getElementById("email_form").value;
			   addUser(11 ,name ,user ,email );
			   console.log(nome);
			   console.log(user);
			   console.log(email);
			   // event.preventDefault();
			} else {
			   return false;
			}
	  }
	});

	// Creates the name validation text box in the form

	createFormTextBox("name_form","name", null, form.containerNode );
	// new ValidationTextBox({
	//   id:'name_form',
	//   placeholder: "Name",
	//   name:'name',
	//   required: true
	// }).placeAt(form.containerNode);

	// Creates the user validation text box in the form
	new ValidationTextBox({
	  id:'user_name_form',
	  placeholder: "User",
	  name:'user_name',
	  required: true
	}).placeAt(form.containerNode);

	// Creates the mail validation text box in the form
	new ValidationTextBox({
	  id:'email_form',
	  placeholder: "Email",
	  name:'email',
	  type:'email',
	  required: true
	}).placeAt(form.containerNode);

	// Submit button for addForm
	var submitbtn = new Button({
		name: 'submit',
		type: 'submit',
		value: 'Submit',
		label: "Submit"
	}).placeAt(form.containerNode);
	
	// Reset button for addForm
	var resetbtn = new Button({
		type: 'reset',
		label: 'Reset'
	}).placeAt(form.containerNode);

	// Cancel button for addForm
	var cancelAdd = new Button({
	  label: "Cancel",
	  onClick: function(){
		addDialog.hide();
	  }
	}).placeAt(form.containerNode);

	// Dialog widget for user inclusion
	var addDialog = new Dialog({ 
	  id: 'addWindow',
	  title: "Enter a new contact",
	  content: form,
	  style: "width: 400px"
	});


  // Add Button
	var addButton = new Button({
	  label: "Add Contact",
	  onClick: function(){
		  addDialog.show();
	  }
	}, "progButtonNode").startup();

/*-------------------------------------------------------------*/
 // Delete User


	var delButton = new Button({
	  label: "Delete Contact",
		  onClick: function(){
		  var contact;
			try{
			  contactsStore.get( selectedRow() ).then(function(person){
				  contact = person.name;
				  console.log( "excluindo", contact);
			  })
				delDialog.show();
			} catch (e) {
				selectUserAlert();		
			}
	  }
	}, "delButton").startup();

	// Dialog widget for user exclusion
	 var delDialog = new Dialog({
	  title: "Remove contact",
	  content: "Confirm the exlcusion of the contact?" 
	 })

	 //Button to confirm exclusion
	 var confirmDel = new Button({
	  label: "Yes",
	  onClick: function(){

		contactsStore.remove(selectedRow());
		grid.refresh();
		delDialog.hide();
	  }
	}).placeAt(delDialog.containerNode);

	// Button to cancel exclusion
	  var cancelDel = new Button({
	  label: "No",
	  onClick: function(){
		delDialog.hide();
	  }
	}).placeAt(delDialog.containerNode);

/*-------------------------------------------------------------*/
  // Edit User

	// Edit Button
	var editButton = new Button({
	  label: "Edit Contact",
	  onClick: function(){

		  var contact;
			try{
			  contactsStore.get( selectedRow() ).then(function(person){
				  contact = person.name;
				  editFormContent(person);
				  console.log("name:", person.name, "user:", person.username, "email:", person.email);
			  })
				editDialog.show();
			}
				catch (e) {
					selectUserAlert();
			}
	  }
	}, "editButton").startup();

		var editForm = new Form({
			encType: 'multipart/form-data',
			action: '',
			method: '',
			onSubmit: function(event){
				if(this.validate()) {
		  
				  // Confirm the editions placed in the fields

				} else {
				   return false;
				}

			}
		});

		// Function append text boxes and buttons to the edit Form
		function editFormContent(person){
				// Creates the name validation text box in the form
				new ValidationTextBox({
				  id:'edit_name_form',
				  placeholder: 'name',
				  name:'name',
				  value: person.name,
				  required: true
				}).placeAt(editForm.containerNode);

				// Creates the user validation text box in the form
				new ValidationTextBox({
				  id:'edit_user_name_form',
				  placeholder: "User",
				  name:'user_name',
				  value: person.username,
				  required: true
				}).placeAt(editForm.containerNode);

				// Creates the mail validation text box in the form
				new ValidationTextBox({
				  id:'edit_email_form',
				  placeholder: "Email",
				  name:'email',
				  type:'email',
				  value: person.email,
				  required: true
				}).placeAt(editForm.containerNode);

				// Submit button for editForm
				var submitbtn = new Button({
					name: 'submit',
					type: 'submit',
					value: 'Submit',
					label: "Submit"
				}).placeAt(editForm.containerNode);
				
				// Reset button for editForm
				var resetbtn = new Button({
					type: 'reset',
					label: 'Reset'
				}).placeAt(editForm.containerNode);

				// Button to cancel edition
				  var cancelEdit = new Button({
					  label: "Cancel",
					  onClick: function(){
						  editDialog.hide();
					  }
				}).placeAt(editForm.containerNode);
		}


		var editDialog = new Dialog({
		  title: "Edit contact information",
		  content: editForm,
		  style: "width: 400px"
		})
/*-------------------------------------------------------------*/
	// Function to show a alert when no user is selected
	function selectUserAlert(){
		 var selectUserDialog = new Dialog({
		  title: "No contact selected!",
		  content: "Please select a contact.",
		  style: "width: 250px;" 
	 })

	 var confirmButton = new Button({
	 		label: "Close",
	 		onClick: function(){
	 			selectUserDialog.hide();
	 		}
	 }).placeAt(selectUserDialog.containerNode);
	 selectUserDialog.show();
	}

/*-------------------------------------------------------------*/

	function createFormTextBox(id, name, value, form){
		new ValidationTextBox({
				  id: id,
				  placeholder: name,
				  name: name,
				  value: value,
				  required: true
				}).placeAt(form);
	}

});

