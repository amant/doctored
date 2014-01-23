/*globals doctored, alert, console*/
(function(){
    "use strict";

    doctored.event.on("app:ready", function(){
        doctored.ready = true;
    });

    var non_breaking_space = "\u00A0",
        defaults = {
            linting_debounce_milliseconds: 500,
            initial_placeholder_element:   "para",
            retry_init_after_milliseconds: 50
        };

    doctored.init = function(selector, options){
        var root_element = document.querySelector(selector),
            instance,
            property;

        options = options || {};

        for (property in defaults) {
            if (options.hasOwnProperty(property)) continue;
            options[property] = defaults[property];
        }

        if(!root_element) return alert("Doctored.js is unable to find the element selected by: " + selector);

        instance = {
            root: root_element,
            root_selector: selector,
            cache: {},
            lint: function(){
                var xml             = '<book xmlns="http://docbook.org/ns/docbook">' + doctored.util.descend_building_xml(this.root.childNodes) + '</book>', //TODO: make this generic, not just DocBook
                    started_linting = doctored.linters.lint(xml, "../../schemas/docbook5/schema.rng", instance.lint_response, instance); //TODO: make this generic, not just DocBook
                if(!started_linting) {
                    //unable to lint ... I guess the workers are busy
                }
            },
            lint_response: function(errors){
                console.log("ERRORS", errors);
            },
            options: options,
            init: function(){
                var default_content,
                    _this = this;

                if(!doctored.ready) {
                    if(this.cache.init_timer) clearTimeout(this.cache.init_timer);
                    this.cache.init_timer = setTimeout( function(){ _this.init(); }, this.options.retry_init_after_milliseconds);
                    return;
                }

                default_content = document.createElement("div");
                default_content.setAttribute("data-element", this.options.initial_placeholder_element);
                default_content.classList.add("block");
                default_content.appendChild(document.createTextNode(non_breaking_space));
                this.root.contentEditable = true;
                this.root.classList.add("doctored");
                this.root.appendChild(default_content);
                this.root.addEventListener("input",   doctored.util.debounce(_this.lint, _this.options.linting_debounce_milliseconds, _this), false);
                this.root.addEventListener('click',   this.click_element, false);
                this.root.addEventListener('keydown', this.keydown_element, false);
                this.root.addEventListener('keyup',   this.keyup_element, false);
                this.root.addEventListener('mouseup', this.mouseup, false);
                if(console && console.log) console.log("Doctored.js: Initialized editor " + this.root_selector + "!");
            }
        };

        instance.init();

        return instance;
    };

    

}());