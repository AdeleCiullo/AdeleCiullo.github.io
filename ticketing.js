(function() {
    let _shadowRoot;
    let _id;
    let _password;

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
        <style>
        </style>
        <div id="ui5_content" name="ui5_content">
         <slot name="content"></slot>
        </div>
        <script id="oView" name="oView" type="sapui5/xmlview">
            
<mvc:View
    xmlns="sap.m"
    xmlns:core="sap.ui.core"
    xmlns:semantic="sap.m.semantic"
    xmlns:l="sap.ui.layout"
    xmlns:f="sap.ui.layout.form"
    xmlns:mvc="sap.ui.core.mvc" class="sapUiSizeCompact" controllerName="ticketingController"> '
            
    <VBox class="sapUiSmallMargin">
        <f:SimpleForm id="SimpleFormChange354" class="sapUiSizeCompact" editable="true" layout="ResponsiveGridLayout" title="Ticket Creation" labelSpanXL="4" labelSpanL="3" labelSpanM="4" labelSpanS="12" adjustLabelSpan="false" emptySpanXL="0" emptySpanL="4" emptySpanM="0" emptySpanS="0" columnsXL="2" columnsL="1" columnsM="1" singleContainerFullSize="false">
            <f:content>
                <Label text="Ticket Type" labelFor="inputTicketType"/>
                <Select id="inputTicketType" change="onChangeSelect" selectedKey="PDR">
                    <items>
                        <core:Item text="Methodology Request" key="MR"/>
                        <core:Item text="Primary Doc Request" key="PDR"/>
                    </items>
                </Select>
                <Label text="Tax Report Number" labelFor="inputTaxReportNumber"/>
                <Input id="inputTaxReportNumber" value="DCLCODE" editable="false"/>
                <Label text="FI Year" labelFor="inputFiYear"/>
                <Input id="inputFiYear" value="REPYEAR" editable="false"/>
                <Label text="Tax Period" labelFor="inputTaxPeriod"/>
                <Input id="inputTaxPeriod" value="DCLPERC" editable="false"/>
                <Label text="Report From" labelFor="inputReportFrom"/>
                <Input id="inputReportFrom" visible="{statusChange>/enableQuestionaire}" liveChange="handleUserInput"/>
                <Label text="Section" labelFor="inputSection"/>
                <Input id="inputSection" visible="{statusChange>/enableQuestionaire}" liveChange="handleUserInput"/>
                <Label text="String" labelFor="inputString"/>
                <Input id="inputString"  visible="{statusChange>/enableQuestionaire}" liveChange="handleUserInput"/>
                <Label text="Request Basis" labelFor="inputRequestBasis"/>
                <Input id="inputRequestBasis" liveChange="handleUserInput" />
                <Label text="Document Type" labelFor="inputDocumentType"/>
                <Input id="inputDocumentType" placeholder="{i18n>placeholderDocType}" liveChange="handleUserInput" visible="{statusChange>/docType}"/>
                <Label text="Request Reason" labelFor="inputRequestReason"/>
                <TextArea id="inputRequestReason" placeholder="{i18n>placeholderReason}" wrapping="None" width="100%" rows="3" liveChange="handleUserInput"/>
                <Label text="FI Document" labelFor="inputFidocNum"/>
                <Label text="FI Document" labelFor="inputFidocNum"/>
                <TextArea id="inputFidocNum" placeholder="placeholderFiDocument" wrapping="None" width="100%" rows="3" liveChange="handleUserInput"/> 
                //   + '
                <Button text="Show Select Dialog (Multi)"  press=".onSelectDialogPress" class="sapUiSmallMarginBottom">
                    <customData>
                        <core:CustomData key="multi" value="true" />
                    </customData>
                </Button>
            </f:content>
        </f:SimpleForm>
        <Button enabled="true" id="sendButton" press="onSendTicket" text="Create Ticket" visible="{statusChange>/sendButton}"/>
    </VBox>
</mvc:View>
        </script>        
    `;

    class InputPassword extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            _shadowRoot.querySelector("#oView").id = _id + "_oView";

            this._export_settings = {};
            this._export_settings.password = "";

            this.addEventListener("click", event => {
                console.log('click');
            });
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
            if (this._subscription) { 
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
            loadthis(this);
        }

        _firePropertiesChanged() {
            this.password = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        password: this.password
                    }
                }
            }));
        }

        // SETTINGS
        get password() {
            return this._export_settings.password;
        }
        set password(value) {
            value = _password;
            this._export_settings.password = value;
        }

        static get observedAttributes() {
            return [
                "password"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("com-fd-djaja-sap-sac-inputpassword", InputPassword);

    // UTILS
    function loadthis(that) {
        var that_ = that;
      
        let content = document.createElement('div');
        content.slot = "content";
        that_.appendChild(content);

        sap.ui.getCore().attachInit(function() {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller"
            ], function(jQuery, Controller) {
                "use strict";

                return Controller.extend("ticketingController", {
                    onSendTicket: function(oEvent) {
    console.log('QAAAA');
                    } 
                });
            });

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView  = sap.ui.xmlview({
                viewContent: jQuery(_shadowRoot.getElementById(_id + "_oView")).html(),
            });
            oView.placeAt(content);


            if (that_._designMode) {
                oView.byId("passwordInput").setEnabled(false);
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
