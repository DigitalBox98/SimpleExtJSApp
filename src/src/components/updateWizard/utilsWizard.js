export default
Ext.define("SYNOCOMMUNITY.RRManager.UpdateWizard.Utils.Wizard", {
    extend: "SYNO.SDS.Wizard.ModalWindow",
    constructor: function (a) {
        this.callParent([Ext.apply({ width: 700, height: 500 }, a)]);
        this.setAllStepSize();
    },
    getValues: function () {
        return this.getAllSteps().reduce(function (b, a) {
            if (Ext.isFunction(a.getValues)) {
                b[a.itemId] = a.getValues();
            }
            return b;
        }, {});
    },
    getSummary: function () {
        return this.getAllSteps().reduce(function (b, a) {
            if (Ext.isFunction(a.getSummary)) {
                b[a.itemId] = a.getSummary();
            }
            return b;
        }, {});
    },
    fireEventToAllSteps: function (b, a) {
        this.getAllSteps().forEach(function (c) {
            c.fireEvent(b, a);
        });
    },
    setAllStepSize: function () {
        this.getAllSteps().forEach(function (a) {
            a.setHeight(Math.max(this.height - 155, 155));
            a.setWidth(Math.max(this.width - 80, 80));
            a.doLayout();
        }, this);
    },
});