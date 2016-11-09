/// <reference path="microsoftteams.d.ts" />
module SJKP.Teams.YammerTab {
    export let groupElm = <HTMLSelectElement>document.getElementById("groups");
    let network = "";

    function getSelection() {
        return groupElm.options[groupElm.selectedIndex];
    }

    function inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    export function setupConfig() {

        if (inIframe()) {
            
            microsoftTeams.initialize();

            login("initial");

            microsoftTeams.settings.registerOnSaveHandler(function (saveEvent) {

                microsoftTeams.settings.setSettings({
                    contentUrl: "https://teamsyammertab.azurewebsites.net/yammerfeed.html?network=" + encodeURIComponent(network) + "&groupId=" + getSelection().value,
                    suggestedDisplayName: "Yammer - " + getSelection().innerHTML,
                    websiteUrl: "https://teamsyammertab.azurewebsites.net",                    
                    customSettings: JSON.stringify({
                        groupId: getSelection().value,
                        network: network
                    })
                });


                saveEvent.notifySuccess();
            });
        }
        
        yam.connect.loginButton('#yammer-login', yammerlogincallback);       
    }

    function login(reason) {        
        console.log(reason);
        yam.getLoginStatus(yammerlogincallback);
    }

    export function refresh(reason) {
        window.location.reload();
    }

    function yammerlogincallback(resp) {
        if (resp.authResponse) {
            var elm = document.getElementById("refresh");
            if (elm != null)
                elm.remove();
            console.log(resp);
            network = resp.network.name;
            document.getElementById('yammer-text').innerHTML = 'Logged into network: ' + resp.network.name;

            yam.platform.request({
                url: "groups.json",     //this is one of many REST endpoints that are available
                method: "GET",
                data: {    //use the data object literal to specify parameters, as documented in the REST API section of this developer site

                },
                success: function (groups) { //print message response information to the console


                    groups.forEach(function (g) {
                        var option = document.createElement("option");
                        option.value = g.id;
                        option.innerHTML = g.full_name;
                        groupElm.appendChild(option);
                    });

                    console.dir(groups);
                },
                error: function (groups) {
                    console.error("There was an error with the request.");
                }
            });
        }
        else {
            microsoftTeams.authentication.authenticate({
                height: 400,
                width: 600,
                url: 'https://www.yammer.com/oauth2/authorize?client_id=oDm6mAqx7thDjYhe1lpyg&response_type=code&redirect_uri=https://teamsyammertab.azurewebsites.net/close.html',
                successCallback: SJKP.Teams.YammerTab.refresh,
                failureCallback: console.error
            });
        }
    }

    export function select() {

        if (getSelection().value != "0") {
            microsoftTeams.settings.setValidityState(true);
        }
    }

    export function setupFeed() {
        
        if (inIframe()) {
            microsoftTeams.initialize();
                                     
                

                
                yam.connect.embedFeed({
                    container: '#embedded-feed',
                    network: getParameterByName('network'),  
                    feedType: 'group',
                    feedId: getParameterByName('groupId')

                });            

        } else {
            //Testing
            yam.connect.embedFeed({
                container: '#embedded-feed',
                network: 'delegate.dk',  // network permalink (see below)
                feedType: 'group',                // can be 'group', 'topic', or 'user'    
                feedId: '3993740'                     // feed ID from the instructions above

            });
        }
    }
}

