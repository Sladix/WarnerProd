import { selector } from 'utils/Selector.js'
import { storage } from 'utils/Storage.js'
import { runtime } from 'utils/Runtime.js'
import { template } from 'utils/template.js'
class Main {
    constructor() {
        this.domains = [];
        this.injection = "";
        this.template = template;

        selector(document).ready(this.bind());
    }

    bind () {
        storage.get({
            domains: [],
            injection: this.template
        }).then((data) => {
            // Set default values or saved options.
            this.domains = data.domains;
            this.injection = data.injection;//data.injection;
            this.checkDomain();
        });

        runtime.api('runtime').onMessage.addListener(
        (request, sender, sendResponse) => {
            if(request.message === "getHost") {
                sendResponse(window.location.hostname);
            }
        });
    }

    checkDomain() {
        let domain = window.location.hostname;
        let match = this.domains.some(d => domain.match(new RegExp(d)));
        if(match) {
            let i = document.createElement('div');
            i.innerHTML = this.injection;
            selector('body').prepend(i);
        }
    }
}

export const main = new Main();
