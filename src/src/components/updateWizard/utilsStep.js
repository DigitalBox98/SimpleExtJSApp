export default
Ext.define("SYNOCOMMUNITY.RRManager.UpdateWizard.Utils.Step", {
    extend: "SYNO.SDS.Wizard.Step",
    autoHideBanner: false,
    constructor: function (a) {
        if (!a.layout) {
            a.layout = { type: "vbox", align: "stretch" };
        }
        if (!a.height) {
            a.height = 330;
        }
        this.callParent([a]);
    },
    hideBanner: function () {
        if (this.owner.banner) {
            this.owner.getComponent("banner").hide();
            this.owner.doLayout();
        }
    },
    showBanner: function () {
        if (this.owner.banner) {
            this.owner.getComponent("banner").show();
            this.owner.doLayout();
        }
    },
    validate: function () {
        return true;
    },
    getValues: Ext.emptyFn,
    getNext: function () {
        debugger
        if (Ext.isFunction(this.validate) && this.validate() !== true) {
            return false;
        }
        this.formPanel.submit();
       // return this.callParent(arguments);
    },
    activate: function () {
        if (this.autoHideBanner) {
            this.hideBanner();
        }
        this.fireEvent("activate");
    },
    deactivate: function () {
        if (this.autoHideBanner) {
            this.showBanner();
        }
        this.fireEvent("deactivate");
    },
    stepWebapiWithMask: function (c) {
        var a = c.scope || this;
        var b = c.callback ? c.callback.bind(a) : null;
        SYNO.SDS.Virtualization.Utils.Helper.maskLoading(this.owner);
        this.sendWebAPI(
            Ext.apply(c, {
                callback: function (g, e, f, d) {
                    SYNO.SDS.Virtualization.Utils.Helper.unmask(this.owner);
                    if (b) {
                        b(g, e, f, d);
                    }
                }.bind(this),
            })
        );
    },
});