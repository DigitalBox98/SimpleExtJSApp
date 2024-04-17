export default
Ext.define("SYNOCOMMUNITY.RRManager.UpdateWizard.ImagePanel", {
    extend: "SYNOCOMMUNITY.RRManager.UpdateWizard.Utils.Step",
    helper: SYNOCOMMUNITY.RRManager.UpdateWizard.Helper,
    constructor: function (a) {
        this.callParent([this.fillConfig(a)]);
    },
    fillConfig: function (a) {
        this.formPanel = new SYNOCOMMUNITY.RRManager.UpdateWizard.NewImagePanel({
            appWin: a.appWin,
            owner: a.owner,
            imageType: a.imageType,
            pollingWindow: a.pollingWindow,
            records: a.records,
            nextId: a.nextId,
        });
        var b = {
            headline: this.helper.T("vm", "specify_image_spec"),
            layout: "fit",
            items: [this.formPanel],
            listeners: { scope: this, activate: this.onActivate },
        };
        Ext.apply(b, a);
        return b;
    },
    checkState: function () {
        this.callParent();
        this.owner.getButton("back").hide();
    },
    onActivate: function () {
        this.formPanel.fireEvent("activate");
    },
    getValues: function () {
        return this.formPanel.getValues();
    },
    validate: function () {
        return this.formPanel.isValid();
    },
});