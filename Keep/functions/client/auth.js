//Recibe el email del usuario que se logueo
var userl;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        //Get notes in database
        if (window.location.pathname === "/notes") {
            db.collection('notes').orderBy('time').onSnapshot(snapshot => {
                userl = user.email;
                index(userl, snapshot);
            });
        }
    } else {
        console.log("No user loged");

        if (window.location.pathname === "/notes") {
            window.location.pathname = "/signin";
        }

    }
});

//Controla la pagina princpipal
function index(userloged, snapshot) {

    //variable para ver si existen notas
    var empty = true;
    var id = "";
    const editModal = document.querySelector('#edit-form');
    const deleteModal = document.querySelector('#delete-form')

    //div donde se agregan las notas
    var notes = document.querySelector("#notes");

    //Vacia el div
    notes.innerHTML = "";

    //Por cada note en la db
    snapshot.docs.forEach(doc => {

        const note = doc.data();

        //Si la note es del userloged la muestra
        if (userloged === note.user) {

            //Existen notas
            empty = false;

            //Div card
            let div1 = document.createElement("div");
            div1.className = "card d-inline-block";

            //Div card-body
            let div2 = document.createElement("div");
            div2.className = "card-body";

            //card-title
            let title = document.createElement("h4");
            title.className = "card-title";
            title.innerHTML = note.title;

            //card-text
            let content = document.createElement("h6");
            content.className = "card-text";
            content.innerHTML = note.content;

            //div card-footer
            let div3 = document.createElement("div");
            div3.className = "card-footer";

            //delete-button
            let button = document.createElement("i");
            button.className = "fas fa-trash";
            button.setAttribute('data-toggle', "modal");
            button.setAttribute('data-target', "#delete-modal");
            button.setAttribute('title', "Delete");

            //edit-button
            let edit = document.createElement("i");
            edit.className = "fas fa-edit";
            edit.setAttribute('data-toggle', "modal");
            edit.setAttribute('data-target', "#edit-modal");
            edit.setAttribute("title", "Edit");

            //time
            let label = document.createElement('label');
            label.className = 'time-label';
            label.innerHTML = 'Created at'

            let time = document.createElement("label");
            time.innerHTML = note.time;
            time.className = "time";

            //appends
            div3.appendChild(label);
            div3.appendChild(time);
            div2.setAttribute('data-id', doc.id);
            div2.appendChild(title);
            div2.appendChild(content);
            div2.appendChild(button);
            div2.appendChild(edit);
            div1.appendChild(div2);
            div1.appendChild(div3);

            notes.appendChild(div1);

            //Delete note
            button.addEventListener('click', (e) => {
                id = e.target.parentElement.getAttribute('data-id');
                console.log(id);
                deleteModal.addEventListener('submit', (e) => {
                    e.preventDefault();
                    db.collection('notes').doc(id).delete().then((cred) => {
                        throw cred;
                        // $('#delete-modal').modal('hide');
                    }).catch(err => {
                        console.log(err);
                    });
                })

            });

            //Edit note

            edit.addEventListener('click', (e) => {
                id = e.target.parentElement.getAttribute('data-id');

                //Cambia los input del modal por los de la nota
                editModal['title-edit'].value = e.target.parentElement.querySelector(".card-title").innerHTML
                editModal['content-edit'].value = e.target.parentElement.querySelector(".card-text").innerHTML

                editModal.addEventListener('submit', (e) => {
                    e.preventDefault();

                    db.collection('notes').doc(id).update({
                        title: editModal['title-edit'].value,
                        content: editModal['content-edit'].value
                    }).catch(err => {
                        console.log(err);
                    });

                })
            })
        }
    });
    if (empty === true) {
        let message = document.createElement("h1");
        message.innerHTML = "Empty. Create a note!";
        notes.appendChild(message);

    }
}



//Create note
if (window.location.pathname === "/notes") {
    const addModal = document.querySelector('#create-form');
    addModal.addEventListener('submit', (e) => {
        e.preventDefault();

        let mTitle = addModal['title'].value;
        let mContent = addModal['content'].value;

        if (mTitle !== "" && mContent !== "") {

            //Agrega el objeto a la db
            db.collection('notes').add({
                title: mTitle,
                content: mContent,
                user: userl,
                time: getActualDate()
            }).then((cred) => {
                addModal['title'].value = "";
                addModal['content'].value = "";
                throw cred;
            }).catch(err => {
                console.log(err);
            });
        }
    });
    //LogOut
    const logOut = document.querySelector('#logout');
    logOut.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
        window.location.href = "/signin";
    });


}




//signin
if (window.location.pathname === "/signin") {
    const loginform = document.querySelector('#login-form');
    //On submit
    loginform.addEventListener('submit', (e) => {
        //No recarga la pagina
        e.preventDefault();

        //Recibe los datos
        const email = loginform['inputEmail'].value;
        const password = loginform['inputPassword'].value;

        //Los guarda en la dbZ
        //auth ==> main.hbs
        auth.signInWithEmailAndPassword(email, password).then(cred => {
            //Redirecciona a /notes

            window.location.href = "/notes";
            throw cred;
        }).catch(err => {
            if (err !== undefined) {
                loginform.querySelector('.error').innerHTML = err.message;
            }
            console.log(err);
        });
    })
}
//signup
if (window.location.pathname === "/signup") {

    const signUpForm = document.querySelector('#signup-form');
    //On submit
    signUpForm.addEventListener('submit', (e) => {
        //No recarga la pagina
        e.preventDefault();
        //Recibe los datos
        const email = signUpForm['inputEmail'].value;
        const password = signUpForm['inputPassword'].value;
        //Los guarda en la db
        //auth ==> main.hbs
        auth.createUserWithEmailAndPassword(email, password).then(cred => {
            //Redirecciona a /signin

            window.location.href = "/signin";
            throw cred;


        }).catch(err => {
            if (err !== undefined) {
                signUpForm.querySelector('.error').innerHTML = err.message;
            }
            console.log(err);
        });
    })
}


function getActualDate() {
    //Get actual date
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var minutos = today.getMinutes();
    if (minutos < 10) {
        minutos = '0' + minutos;
    }
    var segundos = today.getSeconds();
    if (segundos < 10) {
        segundos = '0' + segundos;

    }
    var horas = today.getHours();
    if (horas < 10) {
        horas = '0' + horas;
    }
    var time = horas + ":" + minutos + ":" + segundos;
    var dateTime = date + ' ' + time;
    return dateTime;
}