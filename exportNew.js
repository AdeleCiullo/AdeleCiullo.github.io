(function () {
    let _shadowRoot;
    let _id;
    let _output;

    let div;
    let Ar = [];
    let widgetName;

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

            this._export_settings = {};
            this._export_settings.serverUrl = "";
            this._export_settings.filename = "";
            this._export_settings.dataToExport = "";
            this._export_settings.output = "";
            this._export_settings.data = "";

            this.addEventListener("click", event => {
                console.log('click');
                var event = new Event("onInizialization");
                this.dispatchEvent(event);
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
            } catch (e) { }
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

        // SETTINGS
        getServerUrl() {
            return this.serverUrl;
        }
        setServerUrl(value) {
            this._setValue("serverUrl", value);
        }
        get serverUrl() {
            return this._export_settings.serverUrl;
        }
        set serverUrl(value) {
            this._export_settings.serverUrl = value;
        }


        get output() {
            return this._export_settings.output;
        }
        set output(value) {
            value = _output;
            this._export_settings.output = value;
        }

        get filename() {
            return this._export_settings.filename;
        }
        set filename(value) {
            this._export_settings.filename = value;
        }

        get dataToExport() {
            return this._export_settings.dataToExport;
        }
        set dataToExport(value) {
            this._export_settings.dataToExport = value;
        }

        static get observedAttributes() {
            return [
                "serverUrl",
                "filename",
                "data",
                "output",
                "dataToExport"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("mds-tax-tm-sac-export", Export);

    function UI5(changedProperties, that) {
        var that_ = that;

        div = document.createElement('div');
        widgetName = that._export_settings.name;
        div.slot = "content_" + widgetName;

        var serverURL = that._export_settings.serverUrl;
        var filename = that._export_settings.filename;
        var dataToExport = that._export_settings.dataToExport;

        if (that._firstConnectionUI5 === 0) {



            let div0 = document.createElement('div');
            div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview"><mvc:View class="sapUiSizeCompact" xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:l="sap.ui.layout" controllerName="myView.Template"><Button id="buttonId"  icon="sap-icon://download" press=".onButtonPress"></Button></mvc:View></script>';
            _shadowRoot.appendChild(div0);

            let div1 = document.createElement('div');
            div1.innerHTML = '<div  id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + ' "><slot name="content_' + widgetName + '"></slot></div>';
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
                    onInit: function () { sap.ui.getCore().applyTheme('sap_belize'); },

                    onButtonPress: function (oEvent) {
                        var this_ = this;

                        var body = that.dataToExport;

                        var rows = body.split("#|#");
                        var result = [];
                        var data = [];

                        for (var i = 0; i < rows.length; i++) {
                            var key = "";
                            var header = [];
                            var obj = {};
                            var columns = rows[i].split("#,#");

                            for (var j = 0; j < columns.length; j++) {
                                var columnName = columns[j].split("#:#")[0];
                                var columnValue = columns[j].split("#:#")[1];

                                if (columnName === "Measures" || columnName === "-") {
                                    var measureName = columnValue.split("#-#")[0];
                                    var measureValue = columnValue.split("#-#")[1];

                                    obj[columnName] = {
                                        name: measureName,
                                        value: measureValue
                                    }
                                } else {
                                    key = key + columnValue + "#,# ";
                                    header.push(columnName);
                                }
                            }
                            obj['key'] = key;
                            result.push(obj);
                        }

console.log("result" + result);
                    }



                });
            });


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

    function _doExport(data, filename) {

        var byteCharacters = atob(data);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        var blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        var downloadElement = document.createElement('a');
        var href = window.URL.createObjectURL(blob);
        downloadElement.href = href;
        downloadElement.download = filename;
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
        window.URL.revokeObjectURL(href);
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

})();
