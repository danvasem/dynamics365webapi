
var injector = angular.injector(["ng"]);
var $http = injector.get("$http");
var $q = injector.get("$q");

var urlToken = "https://login.microsoftonline.com/faa1818f-0b43-4391-96d6-f1b72c7dfd79/oauth2/token"; //Oauth para azure de mdcloud
var userCRM = "crm_maint@datafastec.onmicrosoft.com"; //usuario de CRM
var passwordCRM = "D4t4f4$t19"; //password de CRM
var urlCRM = "https://datafastec.crm2.dynamics.com/"; //URL CRM

var applicationId = "51f81489-12ee-4a9e-aaae-a2591f45987d"; //azure application - aplica para todas las organizaciones de CRM Online

var token;

function RequestData() {
    var reqstring = 'client_id=' + applicationId;
    reqstring += '&resource=' + encodeURIComponent(urlCRM);
    reqstring += '&username=' + encodeURIComponent(userCRM);
    reqstring += '&password=' + encodeURIComponent(passwordCRM);
    reqstring += '&grant_type=password';

    console.log(urlToken);

    var promise = GetPromise(urlToken, reqstring);
    promise.then(function (response) {
        var data = response.data;
        console.log("Access Token", data.access_token);
        token = data.access_token;
        var createContactRequest = $http({
            method: 'POST',
            url: urlCRM + 'api/data/v9.1/contacts',
            headers:
            {
                'Authorization': 'Bearer ' + token,
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "application/json",
                "Prefer": "return=representation"
            },
            data:
            {
                "firstname": "Daniel Diaz",
                "emailaddress1": "dani@micorreo.com",
                "telephone1": "91333444"
            },
        });
        return createContactRequest;
    }).then(function (contacto) {
        console.log("Contacto creado", contacto);

        var createIncidentRequest = $http({
            method: 'POST',
            url: urlCRM + 'api/data/v9.1/incidents',
            headers:
            {
                'Authorization': 'Bearer ' + token,
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "application/json",
                "Prefer": "return=representation"
            },
            data:
            {
                "title": "Problema con producto",
                "customerid_contact@odata.bind": "/contacts(" + contacto.data.contactid + ")",
                "description": "Problema con la estabilidad de mi producto"
            },
        });
        return createIncidentRequest;
    }).then(function (caso) {
        console.log("Caso creado", caso);

        var queryIncident = $http({
            method: 'GET',
            url: urlCRM + "api/data/v9.1/incidents?$select=title,statecode&$filter=ticketnumber eq '" + caso.data.ticketnumber+"'&$expand=customerid_contact($select=fullname)",
            headers:
            {
                'Authorization': 'Bearer ' + token,
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "application/json",
                "Prefer": "return=representation"
            }
        });
        return queryIncident;
    }).then(function (caso) {
        console.log("Caso encontrado", caso);
    });
}

function GetPromise(url, data) {
    var config = GetConfig();
    var promise = $http.post(url, data, config);
    return promise;
}

function GetConfig() {
    var config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }
    return config;
}