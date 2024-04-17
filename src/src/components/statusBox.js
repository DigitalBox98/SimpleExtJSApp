export default
Ext.define("SYNOCOMMUNITY.RRManager.Overview.StatusBox", {
    extend: "SYNO.ux.Panel",
    constructor: function (e) {
        this.callParent([this.fillConfig(e)]);
    },
    fillConfig: function (e) {
        (this.appWin = e.appWin),
            (this.tpl = new SYNOCOMMUNITY.RRManager.Overview.StatusBoxTmpl());
        const t = {
            items: [
                {
                    itemId: "statusBox",
                    xtype: "box",
                    cls: "iscsi-overview-statusbox-block",
                    html: "",
                },
            ],
            listeners: {
                scope: this,
                afterrender: this.onAfterRender,
                update: this.updateTpl,
                data_ready: this.onDataReady,
            },
        };
        return Ext.apply(t, e), t;
    },
    onAfterRender: function () {
        this.mon(this.body, "click", this.onMouseClick, this);
    },
    updateTpl: function () {
        this.tpl.overwrite(
            this.getComponent("statusBox").getEl(),
            Ext.apply(
                {
                    type: this.type,
                    clickType:
                        this.owner.clickedBox === this.type ? "click" : "unclick",
                    errorlevel: this.errorlevel,
                    total:
                        this.data.total ||
                        this.data.error + this.data.warning + this.data.healthy,
                },
                this.data
            )
        );
    },
    onMouseClick: function () {
        this.owner.fireEvent("selectchange", this.type);
    },
    processFCTrgSummary: function () {
        const self = this;
        const targets = self.appWin.fcTargets.getAll();
        self.data.total = 0;
        Ext.each(
            targets,
            (target) => {
                self.data.total++;
                if ("connected" === target.get("status")) {
                    self.data.healthy++;
                } else if (target.get("is_enabled") || target.get("status") !== false) {
                    self.data.warning++;
                }
            },
            self
        );
    },
    processTrgSummary: function () {
        const e = this,
            t = e.appWin.iscsiTargets.getAll();
        (e.data.total = 0),
            Ext.each(
                t,
                (t) => {
                    e.data.total++,
                        "connected" === t.get("status")
                            ? e.data.healthy++
                            : t.get("is_enabled") &&
                            "offline" === t.get("status") &&
                            e.data.warning++;
                },
                e
            );
    },
    processLUNSummary: function () {
        const e = this,
            t = e.appWin.iscsiLuns.getAll();
        Ext.each(
            t,
            function (t) {
                let i = "healthy";
                t.isSummaryCrashed(
                    this.appWin.volumes,
                    this.appWin.pools,
                    this.appWin.isLowCapacityWriteEnable()
                )
                    ? (i = "error")
                    : t.isSummaryWarning(this.appWin.volumes, this.appWin.pools) &&
                    (i = "warning"),
                    e.data[i]++;
            },
            e
        );
    },
    processEventSummary: function () {
        const e = this.appWin.summary;
        (this.data.warning = e.warn_count ? e.warn_count : 0),
            (this.data.error = e.error_count ? e.error_count : 0),
            (this.data.healthy = e.info_count ? e.info_count : 0);
    },
    onDataReady: function () {
        console.log("--onDataReady2")
        switch (
        ((this.data = { error: 0, warning: 0, healthy: 0 }), this.storeKey)
        ) {
            case "fc_target_summ":
                this.processFCTrgSummary();
                break;
            case "target_summ":
                this.processTrgSummary();
                break;
            case "lun_summ":
                this.processLUNSummary();
                break;
            case "event_summ":
                this.processEventSummary();
        }
        this.data.error
            ? (this.errorlevel = "error")
            : this.data.warning
                ? (this.errorlevel = "warning")
                : (this.errorlevel = "healthy"),
            this.updateTpl();
    },
});