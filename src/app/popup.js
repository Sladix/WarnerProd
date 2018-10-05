import { selector } from 'utils/Selector.js'
import { runtime } from 'utils/Runtime.js'
import { storage } from 'utils/Storage.js'

import 'styles/popup.scss'

class Popup {
  constructor () {
    selector(document).ready(this.bind());
    this.domains = [];
  }

    bind () {
        /**
         * Load stored domains
         */
        storage.get({
            domains: []
        }).then((data) => {
            // Set default values or saved options.
            this.domains = data.domains;
            this.buildHtmlList(this.domains);
        });

        /**
         * Add a new domain/pattern to the list.
         */
        selector('#submit-domain').click(() => {
            let newdomain = selector('#new-domain').val();
            this.saveDomain(newdomain);
        });

        /**
         * Add the current domain to the list.
         */
        selector('#submit-current').click(() => {
            let self = this;
            runtime.api('tabs').query({active: true, currentWindow: true},function(tabs) {
                runtime.api('tabs').sendMessage(tabs[0].id, {message: "getHost"}, function(domain) {
                    console.log(domain);
                    self.saveDomain(domain)
                });
            });
        });

        /**
         * Open options dropown list.
         */
        selector('.open-options').click(() => {
          // Toggle options list with 'show' class.
          selector('.menu-options').toggle('show')
        });

        /**
         * Open the settings page.
         */
        selector('.open-settings').click(() => {
          if (runtime.api('runtime').openOptionsPage) {
            // New way to open options pages, if supported (Chrome 42+).
            runtime.api('runtime').openOptionsPage()
          } else {
            // Reasonable fallback.
            window.open(runtime.api('runtime').getURL('options.html'))
          }
        })
    }

    /**
     * Removes a domain from the list
     */
    removeDomain(domain) {
        this.domains = this.domains.filter(d => d !== domain);
        storage.save({domains: this.domains})
        .then(() => {
            this.buildHtmlList(this.domains);
        })
    }

    /**
     * Adds a domain from the list
     */
    saveDomain(newdomain) {
        if(newdomain.length < 2 || this.domains.includes(newdomain)) {
            return;
        }

        let options = {domains: [...this.domains, newdomain]};
        this.domains = options.domains;
        storage.save(options)
        .then(() => {
            this.buildHtmlList(this.domains);
        })
    }

    /**
    * Builds the list to display domains
    */
    buildHtmlList(domains) {
        const list = document.createElement('ul');
        domains.forEach(d => {
            let li = document.createElement('li');

            let s = document.createElement('span');
            s.textContent = d;
            li.appendChild(s);

            let deleteBtn = document.createElement('button');
            deleteBtn.textContent = "x";
            deleteBtn.addEventListener('click', () => {
                this.removeDomain(d)
            });
            li.appendChild(deleteBtn);

            list.appendChild(li);
        });

        selector('#domain-list').html("");
        selector('#domain-list').append(list);
    }
}

export const popup = new Popup();
