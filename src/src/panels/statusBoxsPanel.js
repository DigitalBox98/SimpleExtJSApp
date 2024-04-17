export default
Ext.define("SYNOCOMMUNITY.RRManager.Overview.StatusBoxsPanel", {
    extend: "SYNO.ux.Panel",
    constructor: function (e) {
        this.callParent([this.fillConfig(e)]);
    },
    fillConfig: function (e) {
        const statusBoxConfig = { owner: this, appWin: e.appWin, flex: 1 };
        this.selectedBox = "lun";
        this.statusBoxes = [
            new SYNOCOMMUNITY.RRManager.Overview.StatusBox(
                Ext.apply({ type: "lun", title: "LUN", storeKey: "lun_summ" }, statusBoxConfig)
            ),
            new SYNO.ux.Panel({ width: 10 }),
            new SYNOCOMMUNITY.RRManager.Overview.StatusBox(
                Ext.apply(
                    { type: "target", title: "Target", storeKey: "target_summ" },
                    statusBoxConfig
                )
            ),
            new SYNO.ux.Panel({ width: 10 }),
            new SYNOCOMMUNITY.RRManager.Overview.StatusBox(
                Ext.apply(
                    {
                        type: "fctarget",
                        title: "FCTarget",
                        storeKey: "fc_target_summ",
                    },
                    statusBoxConfig
                )
            ),
            new SYNO.ux.Panel({ width: 10 }),
            new SYNOCOMMUNITY.RRManager.Overview.StatusBox(
                Ext.apply(
                    {
                        type: "event",
                        title: "Events",
                        storeKey: "event_summ",
                    },
                    statusBoxConfig
                )
            ),
        ];
        if (!e.appWin.supportFC) {
            this.statusBoxes.splice(4, 2);
        }
        const panelConfig = {
            cls: "iscsi-overview-status-panel",
            layout: "hbox",
            layoutConfig: { align: "stretch" },
            items: this.statusBoxes,
            listeners: {
                scope: this,
                selectchange: this.onSelectChange,
                data_ready: this.onDataReady,
            },
        };
        return Ext.apply(panelConfig, e), panelConfig;
    },
    onSelectChange: function (e) {
        (this.clickedBox = e),
            Ext.each(this.statusBoxs, (e) => {
                e.fireEvent("update");
            }),
            this.owner.panels.detailPanel.fireEvent("select", e);
    },

    onDataReady: function () {
        console.log("--onDataReady3")
        Ext.each(this.statusBoxs, (e) => {
            e.fireEvent("data_ready");
        });
    },
});