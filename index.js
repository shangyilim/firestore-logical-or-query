firebase.initializeApp({
  apiKey: '### FIREBASE API KEY ###',
  authDomain: '### FIREBASE AUTH DOMAIN ###',
  projectId: '### CLOUD FIRESTORE PROJECT ID ###'
});

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// Create test data
var citiesRef = db.collection("cities");

citiesRef.doc("SF").set({
    name: "San Francisco", state: "CA", country: "USA",
    capital: false, population: 860000
});
citiesRef.doc("LA").set({
    name: "Los Angeles", state: "CA", country: "USA",
    capital: false, population: 3900000
});
citiesRef.doc("DE").set({
    name: "Denver", state: "CO", country: "USA",
    capital: false, population: 3900000
});
citiesRef.doc("DC").set({
    name: "Washington, D.C.", state: null, country: "USA",
    capital: true, population: 680000
});
citiesRef.doc("TOK").set({
    name: "Tokyo", state: null, country: "Japan",
    capital: true, population: 9000000
});

// Query for California
var californiaRef = citiesRef.where("state", "==", "CA");

// Query for Colorado
var coloradoRef = citiesRef.where("state", "==", "CO");

// Create Observables.
var california$ = new Rx.Subject();
var colorado$ = new Rx.Subject();

// Hook values from callback to the observable
californiaRef.onSnapshot((querySnapshot) => {
    var data = querySnapshot.docs.map(d => d.data());
    california$.next(data);
});

coloradoRef.onSnapshot((querySnapshot) => {
    var data = querySnapshot.docs.map(d => d.data());
    colorado$.next(data);
});

// When either California OR Colorado values are emitted from their queries,
// combine both observables 
var californiaOrColorado$ = Rx.Observable.combineLatest(california$, colorado$).switchMap((states) => {
    // Destructure the values to combine a single array.
    var [california, colorado] = states;
    var combined = california.concat(colorado);

    // Return as a new Observable that contains the combined list.
    return Rx.Observable.of(combined);
})

// Subscribe to the latest stream that contains both California and Colorado.
californiaOrColorado$.subscribe((result) => {

    // Output to UI.
    var citiesEle = document.getElementById('cities');
    result.forEach(city => {
        var itemEle = document.createElement("li");
        itemEle.textContent = city.name;
        citiesEle.appendChild(itemEle);
    });
})

