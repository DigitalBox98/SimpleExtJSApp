export default
Ext.define("SYNOCOMMUNITY.RRManager.Debug.Main", {
    extend: "SYNO.SDS.Utils.TabPanel",
    API: {},
    constructor: function (e) {
        (this.appWin = e.appWin),
            (this.owner = e.owner),
            this.callParent([this.fillConfig(e)]);
    },
    _prefix: '/webman/3rdparty/rr-manager/',
    callCustomScript: function (scriptName) {

        return new Promise((resolve, reject) => {
            Ext.Ajax.request({
                url: `${this._prefix}${scriptName}`,
                method: 'GET',
                timeout: 60000,
                headers: {
                    'Content-Type': 'text/html'
                },
                success: function (response) {
                    // if response text is string need to decode it
                    if (typeof response?.responseText === 'string') {
                        resolve(Ext.decode(response?.responseText));
                    } else {
                        resolve(response?.responseText);
                    }
                },
                failure: function (result) {
                    if (typeof result?.responseText === 'string' && result?.responseText && !result?.responseText.startsWith('<')) {
                        var response = Ext.decode(result?.responseText);
                        reject(response?.error);
                    }
                    else {
                        reject('Failed with status: ' + result?.status);
                    }
                }
            });
        });
    },
    fillConfig: function (e) {
        this.generalTab = new SYNOCOMMUNITY.RRManager.Debug.GeneralTab({
            appWin: this.appWin,
            owner: this,
            itemId: "GeneralTab",
        });

        const tabs = [this.generalTab];

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
    getConf: function () {
        return this.callCustomScript('getNetworkInfo.cgi')
    },
    setConf: function () {
        var user_config = this.getParams();
        var rrConfigJson = localStorage.getItem("rrConfig");
        var rrConfigOrig = JSON.parse(rrConfigJson);
        rrConfigOrig.user_config = user_config;
        localStorage.setItem("rrConfig", JSON.stringify(rrConfigOrig));

        return this.appWin.handleFileUpload(user_config);
    }
});
