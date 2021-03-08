(function () {
    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
      </style>
    `;

    class Export extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            //_shadowRoot.querySelector("#oView").id = _id + "_oView";

            this._export_settings = {};
            this._export_settings.restapiurl = "";
            this._export_settings.output = "";
            this._export_settings.name = "";
            this._export_settings.data = "";

            this.addEventListener("click", event => {
                console.log('click');
            });

            this._firstConnection = 0;
            this._firstConnectionUI5 = 0;

        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { // react store subscription
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            UI5(changedProperties, this);
        }

        _renderExportButton() {
            let components = this.metadata ? JSON.parse(this.metadata)["components"] : {};
            console.log("_renderExportButton-components");
            console.log(components);
        }

        _firePropertiesChanged() {
            this.output = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        output: this.output
                    }
                }
            }));
        }

        // DISPLAY
        getButtonIconVisible() {
            return this.showIcons;
        }
        setButtonIconVisible(value) {
            this._setValue("showIcons", value);
        }

        get showIcons() {
            return this._showIcons;
        }
        set showIcons(value) {
            this._showIcons = value;
        }

        getButtonTextVisible() {
            return this.showTexts;
        }
        setButtonTextVisible(value) {
            this._setValue("showTexts", value);
        }

        get showTexts() {
            return this._showTexts;
        }
        set showTexts(value) {
            this._showTexts = value;
        }

        get showComponentSelector() {
            return this._showComponentSelector;
        }
        set showComponentSelector(value) {
            this._showComponentSelector = value;
        }

        get enablePpt() {
            return this._enablePPT;
        }
        set enablePpt(value) {
            this._enablePPT = value;
        }


        // SETTINGS
        getServerUrl() {
            return this.serverURL;
        }
        setServerUrl(value) {
            this._setValue("serverURL", value);
        }

        get serverURL() {
            return this._export_settings.server_urls;
        }
        set serverURL(value) {
            this._export_settings.server_urls = value;
            this._updateSettings();
        }

        getFilename() {
            return this.filename;
        }
        setFilename(value) {
            this._setValue("filename", value);
        }

        get filename() {
            return this._export_settings.filename;
        }
        set filename(value) {
            this._export_settings.filename = value;
            this._updateSettings();
        }

        get pptSelectedWidgets() {
            return this._export_settings.ppt_exclude;
        }
        set pptSelectedWidgets(value) {
            this._export_settings.ppt_exclude = value;
            this._updateSettings();
        }

        get metadata() {
            return this._export_settings.metadata;
        }
        set metadata(value) {
            this._export_settings.metadata = value;
            this._updateSettings();
        }

        static get observedAttributes() {
            return [
                "metadata"
            ];
        }

        // METHODS
        _updateSettings() {
            this.settings.value = JSON.stringify(this._export_settings);
        }

        _setValue(name, value) {
            this[name] = value;

            let properties = {};
            properties[name] = this[name];
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: properties
                }
            }));
        }

        doExport(format, overrideSettings) {
            let settings = JSON.parse(JSON.stringify(this._export_settings));

            setTimeout(() => {
                this._doExport(format, settings, overrideSettings);
            }, 200);
        }

        _doExport(format, settings, overrideSettings) {
            if (this._designMode) {
                return false;
            }

            if (overrideSettings) {
                let set = JSON.parse(overrideSettings);
                set.forEach(s => {
                    settings[s.name] = s.value;
                });
            }

            settings.format = format;
            settings.URL = location.protocol + "//" + location.host;
            settings.dashboard = location.href;
            settings.title = document.title;
            settings.cookie = document.cookie;
            settings.scroll_width = document.body.scrollWidth;
            settings.scroll_height = document.body.scrollHeight;

            // try detect runtime settings
            if (window.sap && sap.fpa && sap.fpa.ui && sap.fpa.ui.infra) {
                if (sap.fpa.ui.infra.common) {
                    let context = sap.fpa.ui.infra.common.getContext();

                    let app = context.getAppArgument();
                    settings.appid = app.appId;

                    let user = context.getUser();
                    settings.sac_user = user.getUsername();

                    if (settings.lng == "") {
                        settings.lng = context.getLanguage();
                    }
                }
                if (sap.fpa.ui.infra.service && sap.fpa.ui.infra.service.AjaxHelper) {
                    settings.tenant_URL = sap.fpa.ui.infra.service.AjaxHelper.getTenantUrl(false); // true for PUBLIC_FQDN
                }
            }

            this.dispatchEvent(new CustomEvent("onStart", {
                detail: {
                    settings: settings
                }
            }));

            let sendHtml = true;
            if (settings.application_array && settings.oauth) {
                sendHtml = false;
            }
            if (sendHtml) {
                // add settings to html so they can be serialized
                // NOTE: this is not "promise" save!
                this.settings.value = JSON.stringify(settings);

                getHtml(settings).then(html => {
                    this._updateSettings(); // reset settings
                    this._createExportForm(settings, html);

                }, reason => {
                    console.error("Error in getHtml:", reason);
                });
            } else {
                this._createExportForm(settings, null);
            }
        }

        _createExportForm(settings, content) {
            this.dispatchEvent(new CustomEvent("onSend", {
                detail: {
                    settings: settings
                }
            }));

            let form = document.createElement("form");

            let settingsEl = form.appendChild(document.createElement("input"));
            settingsEl.name = "export_settings_json";
            settingsEl.type = "hidden";
            settingsEl.value = JSON.stringify(settings);

            if (content) {
                let contentEl = form.appendChild(document.createElement("input"));
                contentEl.name = "export_content";
                contentEl.type = "hidden";
                contentEl.value = content;
            }

            let host = settings.server_urls;
            let url = host + "";

            this._submitExport(host, url, form, settings);
        }

        _submitExport(host, exportUrl, form, settings) {
            this._serviceMessage = "";
            var that = this;

            // handle response types
            let callback = (error, filename, blob) => {
                if (error) {
                    this._serviceMessage = error;
                    this.dispatchEvent(new CustomEvent("onError", {
                        detail: {
                            error: error,
                            settings: settings
                        }
                    }));

                    console.error("Export failed:", error);
                } else if (filename) {
                    if (filename.indexOf("E:") === 0) {
                        callback(new Error(filename)); // error...
                        return;
                    }

                    this._serviceMessage = "Export has been produced";
                    this.dispatchEvent(new CustomEvent("onReturn", {
                        detail: {
                            filename: filename,
                            settings: settings
                        }
                    }));

                    if (blob) { // download blob

                        let downloadUrl = URL.createObjectURL(blob);
                        let a = document.createElement("a");
                        a.download = filename;
                        a.href = downloadUrl;
                        document.body.appendChild(a);
                        a.click();

                        setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(downloadUrl);
                        }, 0);

                    }
                }
            };

            if (exportUrl.indexOf(location.protocol) == 0 || exportUrl.indexOf("http:") == 0) { // same protocol => use fetch?
                fetch(exportUrl, {
                    method: "POST",
                    mode: "cors",
                    body: new FormData(form),
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    }
                }).then(response => {
                    if (response.ok) {
                        return response.blob().then(blob => {
                            console.log(that.getFilename());
                            callback(null, that.getFilename(), blob);
                        });
                        return response.text().then(text => {
                            callback(null, text);
                        });
                    } else {
                        throw new Error(response.status + ": " + response.statusText);
                    }
                }).catch(reason => {
                    callback(reason);
                });
            } else { // use form with blank target...
                form.action = exportUrl;
                form.target = "_blank";
                form.method = "POST";
                form.acceptCharset = "utf-8";
                this._shadowRoot.appendChild(form);

                form.submit();
                form.remove();

                callback(null, "I:Export running in separate tab");
            }
        }

    }
    customElements.define("mds-tax-tm-sac-export", Export);

    function UI5(changedProperties, that) {
        var that_ = that;

        div = document.createElement('div');
        widgetName = that._export_settings.name;
        div.slot = "content_" + widgetName;

        var restAPIURL = that._export_settings.restapiurl;
        console.log("restAPIURL: " + restAPIURL);

        if (that._firstConnectionUI5 === 0) {
            console.log("--First Time --");

            let div0 = document.createElement('div');
            div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview"><mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:l="sap.ui.layout" height="100%" controllerName="myView.Template"><l:VerticalLayout class="sapUiContentPadding" width="100%"><Button id="buttonId" class="sapUiSmallMarginBottom" text="Download" width="150px" press=".onButtonPress" /></l:VerticalLayout></mvc:View></script>';
            _shadowRoot.appendChild(div0);

            let div1 = document.createElement('div');
            div1.innerHTML = '<div id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + '"><slot name="content_' + widgetName + '"></slot></div>';
            _shadowRoot.appendChild(div1);

            that_.appendChild(div);

            var mapcanvas_divstr = _shadowRoot.getElementById('oView_' + widgetName);

            Ar.push({
                'id': widgetName,
                'div': mapcanvas_divstr
            });
            console.log(Ar);
        }

        sap.ui.getCore().attachInit(function () {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller",
                "sap/m/MessageToast",
                'sap/m/MessageBox'
            ], function (jQuery, Controller, MessageToast, MessageBox) {
                "use strict";

                return Controller.extend("myView.Template", {


                    onButtonPress: function (oEvent) {
                        var this_ = this;

                        var CLIENT_ID_str = 'sb-download!t77927';
                        var CLIENT_SECRET_str = 'tqTFIG7fbxLlCSZYs2x8yh2UBHo=';

                        $.ajax({
                            type: 'GET',
                            url: "https://sapit-finance-dev.authentication.eu10.hana.ondemand.com/oauth/token",
                            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                            crossDomain: true,
                            cache: true,
                            dataType: 'json',
                            data: {
                                client_id: CLIENT_ID_str,
                                client_secret: CLIENT_SECRET_str,
                                grant_type: 'client_credentials',
                            },

                            success: function (data) {
                                console.log(data);

                                var access_token = data.access_token;

                                $.ajax({
                                    url: restAPIURL,
                                    type: 'GET',
                                    headers: {
                                        "Authorization": "Bearer " + access_token,
                                        "Content-Type": "application/x-www-form-urlencoded"
                                    },

                                    async: true,
                                    timeout: 0,
                                    contentType: 'application/x-www-form-urlencoded',
                                    success: function (data) {

                                        console.log(data);
                                        _output = data;

                                        that._firePropertiesChanged();
                                        this.settings = {};
                                        this.settings.output = "";

                                        that.dispatchEvent(new CustomEvent("onStart", {
                                            detail: {
                                                settings: this.settings
                                            }
                                        }));

                                    },
                                    error: function (e) {

                                        console.log("error: " + e);
                                        console.log(e);
                                    }
                                });

                            },
                            error: function (e) {

                                console.log(e.responseText);
                            }
                        });
                    },

                });
            });

            console.log("widgetName:" + widgetName);
            var foundIndex = Ar.findIndex(x => x.id == widgetName);
            var divfinal = Ar[foundIndex].div;

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView = sap.ui.xmlview({
                viewContent: jQuery(divfinal).html(),
            });

            oView.placeAt(div);

            if (that_._designMode) {
                oView.byId("buttonId").setEnabled(false);
            } else {
                oView.byId("buttonId").setEnabled(true);
            }
        });
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

})();
