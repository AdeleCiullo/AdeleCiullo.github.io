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


            this.addEventListener("click", event => {
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
            this.dataToExport = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        dataToExport: this.dataToExport
                    }
                }
            }));
        }

        // SETTINGS



        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("mds-tax-tm-sac-ticketing", Ticketing);

    function UI5(changedProperties, that) {
        var that_ = that;

        div = document.createElement('div');
        widgetName = that._export_settings.name;
        div.slot = "content_" + widgetName;

     
        if (that._firstConnectionUI5 === 0) {



            let div0 = document.createElement('div');
            div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview">'+
         '<mvc:View xmlns="sap.m" xmlns:core="sap.ui.core" xmlns:semantic="sap.m.semantic" xmlns:l="sap.ui.layout" xmlns:f="sap.ui.layout.form" xmlns:mvc="sap.ui.core.mvc" class="sapUiSizeCompact" controllerName="ticketingController"> '
                + '<VBox class="sapUiSmallMargin">'
                + '<f:SimpleForm id="SimpleFormChange354" class="sapUiSizeCompact" editable="true" layout="ResponsiveGridLayout" title="Ticket Creation" labelSpanXL="4" labelSpanL="3" labelSpanM="4" labelSpanS="12" adjustLabelSpan="false" emptySpanXL="0" emptySpanL="4" emptySpanM="0" emptySpanS="0" columnsXL="2" columnsL="1" columnsM="1" singleContainerFullSize="false">'
                + '<f:content> <Label text="Ticket Type" labelFor="inputTicketType"/>'
                + '<Select id="inputTicketType" change="onChangeSelect" selectedKey="PDR"><items> <core:Item text="Methodology Request" key="MR"/><core:Item text="Primary Doc Request" key="PDR"/></items></Select>'
                + '<Label text="Tax Report Number" labelFor="inputTaxReportNumber"/> <Input id="inputTaxReportNumber" value="DCLCODE" editable="false"/>'
                + '<Label text="FI Year" labelFor="inputFiYear"/><Input id="inputFiYear" value="REPYEAR" editable="false"/>'
                + '<Label text="Tax Period" labelFor="inputTaxPeriod"/><Input id="inputTaxPeriod" value="DCLPERC" editable="false"/>'
                + '<Label text="Report From" labelFor="inputReportFrom"/> <Input id="inputReportFrom" visible="{statusChange>/enableQuestionaire}" liveChange="handleUserInput"/>'
                + '<Label text="Section" labelFor="inputSection"/><Input id="inputSection" visible="{statusChange>/enableQuestionaire}" liveChange="handleUserInput"/>'
                + '<Label text="String" labelFor="inputString"/><Input id="inputString"  visible="{statusChange>/enableQuestionaire}" liveChange="handleUserInput"/>'
                + '<Label text="Request Basis" labelFor="inputRequestBasis"/><Input id="inputRequestBasis" liveChange="handleUserInput" />'
                + '<Label text="Document Type" labelFor="inputDocumentType"/> <Input id="inputDocumentType" placeholder="{i18n>placeholderDocType}" liveChange="handleUserInput" visible="{statusChange>/docType}"/>'
                + '<Label text="Request Reason" labelFor="inputRequestReason"/><TextArea id="inputRequestReason" placeholder="{i18n>placeholderReason}" wrapping="None" width="100%" rows="3" liveChange="handleUserInput"/> '
                + '<Label text="FI Document" labelFor="inputFidocNum"/>'
                + '<Label text="FI Document" labelFor="inputFidocNum"/><TextArea id="inputFidocNum" placeholder="placeholderFiDocument" wrapping="None" width="100%" rows="3" liveChange="handleUserInput"/> '
                //   + '<Button text="Show Select Dialog (Multi)"  press=".onSelectDialogPress" class="sapUiSmallMarginBottom"><customData><core:CustomData key="multi" value="true" /></customData></Button>'
                + '</f:content></f:SimpleForm><Button enabled="true" id="sendButton" press="onSendTicket" text="Create Ticket" visible="{statusChange>/sendButton}"/></VBox></mvc:View>'
                + '</script>';
            
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
                'sap/m/MessageBox',
                'sap/ui/export/Spreadsheet',
                'sap/ui/model/json/JSONModel'
            ], function (jQuery, Controller, MessageToast, MessageBox, Spreadsheet, JSONModel) {
                "use strict";

                return Controller.extend("ticketingController", {
                     onInit: function () {
                    //Model for visability
                    var oData = {
                        enableStatusVisability: false,
                        enableQuestionaire: false,
                        sendButton: true,
                        docType: true,
                        pdf: 2
                    };
                    var oModel = new sap.ui.model.json.JSONModel(oData);

                    this.getView().setModel(oModel, "statusChange");

                },
                _validateTextFieldValues: function () {
                    // tgets the textfields values
                    var oinputRequestBasis = this.getView().byId("inputRequestBasis"),
                        oinputDocumentType = this.getView().byId("inputDocumentType"),
                        oinputRequestReason = this.getView().byId("inputRequestReason"),
                        oinputReportFrom = this.getView().byId("inputReportFrom"),
                        oinputString = this.getView().byId("inputString"),
                        oinputSection = this.getView().byId("inputSection"),
                        oKey = this.getView().byId("inputTicketType").getSelectedKey(),
                        missingInput = true;

                    //different ticket types -> different fileds to check
                    //when there is sth missing the inputfiled is marked as error
                    if (oKey == "PDR") {
                        if (oinputRequestBasis.getValue() === "") {
                            oinputRequestBasis.setValueState(sap.ui.core.ValueState.Error);
                            missingInput = false;
                        }
                        if (oinputDocumentType.getValue() === "") {
                            oinputDocumentType.setValueState(sap.ui.core.ValueState.Error);
                            missingInput = false;
                        }
                    }
                    if (oKey == "MR") {
                        if (oinputRequestBasis.getValue() === "") {
                            oinputRequestBasis.setValueState(sap.ui.core.ValueState.Error);
                            missingInput = false;
                        }
                        if (oinputRequestReason.getValue() === "") {
                            oinputRequestReason.setValueState(sap.ui.core.ValueState.Error);
                            missingInput = false;
                        }
                        if (oinputReportFrom.getValue() === "") {
                            oinputReportFrom.setValueState(sap.ui.core.ValueState.Error);
                            missingInput = false;
                        }
                        if (oinputSection.getValue() === "") {
                            oinputSection.setValueState(sap.ui.core.ValueState.Error);
                            missingInput = false;
                        }
                        if (oinputString.getValue() === "") {
                            oinputString.setValueState(sap.ui.core.ValueState.Error);
                            missingInput = false;
                        }

                    }

                    //MessageBox appear when there is a missing entry
                    if (!missingInput) {
                        MessageBox.error("missingentries");
                        return false;
                    }
                    return true;


                },
                onChangeSelect: function (oEvent) {
                    var oModel = this.getView().getModel("statusChange"),
                        oKey = oEvent.getParameters().selectedItem.getKey();

                    switch (oKey) {
                        case "MR":
                            oModel.setData({
                                enableQuestionaire: true,
                                docType: false
                            }, true);
                            break;
                        case "PDR":
                            oModel.setData({
                                enableQuestionaire: false,
                                docType: false
                            }, true);
                            break;
                    }

                    oModel.refresh(true);
                },
                handleUserInput: function (oEvent) {
                    //error when user didn't filled a filed
                    var sUserInput = oEvent.getParameter("value");
                    var oInputControl = oEvent.getSource();

                    if (sUserInput) {
                        oInputControl.setValueState(sap.ui.core.ValueState.Success);
                    } else {
                        oInputControl.setValueState(sap.ui.core.ValueState.Error);
                    }
                },
                 onSendTicket: function () {
                    //get Input of User
                    var oView = this.getView(),
                        oKey = oView.byId("inputTicketType").getSelectedItem().getText(),
                        oInputTaxReportNumber = oView.byId("inputTaxReportNumber").getValue(),
                        oInputFiYear = oView.byId("inputFiYear").getValue(),
                        oInputTaxPeriod = oView.byId("inputTaxPeriod").getValue(),
                        oInputReportFrom = oView.byId("inputReportFrom").getValue(),
                        oInputSection = oView.byId("inputSection").getValue(),
                        oInputString = oView.byId("inputString").getValue(),
                        oInputRequestBasis = oView.byId("inputRequestBasis").getValue(),
                        oInputDocumentType = oView.byId("inputDocumentType").getValue(),
                        oInputRequestReason = oView.byId("inputRequestReason").getValue(),
                        oInputFidocNum = oView.byId("inputFidocNum").getValue();
                    // oInputFidocNum = oView.byId("inputFidocNum").getSelectedItem().getText(),
                    //  oInputFidocCC = oView.byId("inputCompanyCode").getValue(),
                    //   oInputFidocYear = oView.byId("inputFiscalYear").getValue(),


                    var oRequestData = {
                        "reqtype": oKey,
                        "tax": oInputTaxReportNumber,
                        "taxyear": oInputFiYear,
                        "taxperiod": oInputTaxPeriod,
                        "reportform": oInputReportFrom,
                        "sectionsheet": oInputSection,
                        "string": oInputString,
                        "reqbasis": oInputRequestBasis,
                        "doctype": oInputDocumentType,
                        "reqreason": oInputRequestReason,
                        "fidocument": oInputFidocNum
                    };

                    //Validation if sth missing only If everythig is correct a post request ist possible
                    if (this._validateTextFieldValues()) {

                        $.ajax({
                            type: "POST",
                            url: "srv-api/emailService/Tickets?",
                            contentType: "application/json",
                            data: JSON.stringify(oRequestData),
                            success: function (oSuccess) {
                                sap.m.MessageToast.show("Ticket Created");
                            },
                            error: function (oError) {
                                sap.m.MessageToast.show("errorMsg" + oError.responseText);
                            }
                        });


                    } else {
                        sap.m.MessageToast.show("errorMsg" + oError.responseText);
                    }
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


    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

})();
