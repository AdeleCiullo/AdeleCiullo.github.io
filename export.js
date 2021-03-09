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
             this._export_settings.output = "";
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

         static get observedAttributes() {
             return [
                "serverUrl",
                "filename",
                "data",
                "output"
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
         console.log("serverURL: " + serverURL);

         if (that._firstConnectionUI5 === 0) {
             console.log("--First Time --");

             let div0 = document.createElement('div');
             div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview"><mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:l="sap.ui.layout" height="100%" controllerName="myView.Template"><l:VerticalLayout class="sapUiContentPadding" width="100%"><Button id="buttonId" class="sapUiSmallMarginBottom" text="Download" icon="sap-icon://download" width="150px" press=".onButtonPress" /></l:VerticalLayout></mvc:View></script>';
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
                                     url: serverURL,
                                     type: 'GET',
                                     headers: {
                                         "Authorization": "Bearer " + access_token,
                                         "Content-Type": "application/x-www-form-urlencoded"
                                     },

                                     async: true,
                                     timeout: 0,
                                     contentType: 'application/x-www-form-urlencoded',
                                     responseType: "arraybuffer",
                                     success: function (data) {

                                         console.log(data);
                                         _output = data;

                                         _doExport(_output, filename);
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

     function _doExport(data, filename) {
      
        var dataFormat = new Uint8Array(atob(data).split("").map(function(c) {
                        return c.charCodeAt(0);
                    }));
         var blob = new Blob([dataFormat], {
             type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
         });

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
