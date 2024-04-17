export default
Ext.define("SYNOCOMMUNITY.RRManager.Setting.Main", {
    extend: "SYNO.SDS.Utils.TabPanel",
    API: {},// SYNO.SDS.iSCSI.Utils.API,
    constructor: function (e) {
        (this.appWin = e.appWin),
            (this.owner = e.owner),
            this.callParent([this.fillConfig(e)]);
    },
    fillConfig: function (e) {
        this.generalTab = new SYNOCOMMUNITY.RRManager.Setting.GeneralTab({
            appWin: this.appWin,
            owner: this,
            itemId: "GeneralTab",
        });

        this.rrConfigTab = new SYNOCOMMUNITY.RRManager.Setting.RRConfigTab({
            appWin: this.appWin,
            owner: this,
            itemId: "RRConfigTab",
        });

        this.synoInfoTab = new SYNOCOMMUNITY.RRManager.Setting.SynoInfoTab({
            appWin: this.appWin,
            owner: this,
            itemId: "SynoInfoTab",
        });

        const tabs = [this.generalTab, this.rrConfigTab, this.synoInfoTab];

        const settingsConfig = {
            title: "Settings",
            autoScroll: true,
            useDefaultBtn: true,
            labelWidth: 200,
            fieldWidth: 240,
            activeTab: 0,
            deferredRender: false,
            items: tabs,
            listeners: {
                activate: this.updateAllForm,
                scope: this
            },
        };

        return Ext.apply(settingsConfig, e);
    },
    loadAllForms: function (e) {
        this.items.each((t) => {
            if (Ext.isFunction(t.loadForm)) {
                if (t.itemId == "SynoInfoTab") {
                    t.loadForm(e.synoinfo);
                } else {
                    t.loadForm(e);
                }
            }
        });
    },
    updateEnv: function (e) {
    },
    updateAllForm: async function () {
        this.setStatusBusy();
        try {
            const e = await this.getConf();
            this.loadAllForms(e), this.updateEnv(e);
        } catch (e) {
            SYNO.Debug(e);
        }
        this.clearStatusBusy();
    },
    applyHandler: function () {
        this.confirmApply() && this.doApply().catch(() => { });
    },
    doApply: async function () {
        this.setStatusBusy();
        try {
            (async () => {
                await this.setConf();
                await this.updateAllForm();
                await this.appWin.runScheduledTask('ApplyRRConfig');
                this.clearStatusBusy();
                this.setStatusOK();
            })();
        } catch (e) {
            SYNO.Debug(e);
            this.clearStatusBusy();
            this.appWin.getMsgBox().alert(this.title, this.API.getErrorString(e));
            throw e;
        }
    },
    getParams: function () {
        const generalTab = this.generalTab.getForm().getValues();
        const rrConfigTab = this.rrConfigTab.getForm().getValues();

        const synoInfoTab = this.synoInfoTab.getForm().getValues();
        const synoInfoTabFixed = {
            synoinfo: synoInfoTab
        };

        var rrConfigJson = localStorage.getItem("rrConfig");
        var rrConfig = JSON.parse(rrConfigJson);
        return Object.assign(rrConfig?.user_config, generalTab, rrConfigTab, synoInfoTabFixed);
    },
    getConf: function () {
        var rrConfigJson = localStorage.getItem("rrConfig");
        var rrConfig = JSON.parse(rrConfigJson);

        return rrConfig?.user_config;
    },
    setConf: function () {
        var user_config = this.getParams();
        var rrConfigJson = localStorage.getItem("rrConfig");
        var rrConfigOrig = JSON.parse(rrConfigJson);
        rrConfigOrig.user_config = user_config;
        localStorage.setItem("rrConfig", JSON.stringify(rrConfigOrig));

        return this.appWin.handleFileUpload(user_config);
    },
    confirmApply: function () {
        if (!this.isAnyFormDirty())
            return (
                this.setStatusError({
                    text: this._V("ui", "frm_validation_no_change"),
                    clear: !0,
                }),
                !1
            );
        const e = this.getAllForms().find((e) => !e.isValid());
        return (
            !e ||
            (this.setActiveTab(e.itemId),
                this.setStatusError({
                    text: this._V("ui", "frm_validation_fill_required_fields"),
                }),
                !1)
        );
    },
    onPageConfirmLostChangeSave: function () {
        return this.confirmApply() ? this.doApply() : Promise.reject();
    },
});