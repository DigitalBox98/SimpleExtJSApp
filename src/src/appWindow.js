import helper from './utils/updateWizardHelper';
export default
// Window definition
Ext.define('SYNOCOMMUNITY.RRManager.AppWindow', {
    helper: SYNOCOMMUNITY.RRManager.UpdateWizard.Helper,
    formatString: function (str, ...args) {
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },
    extend: "SYNO.SDS.PageListAppWindow",
    activePage: "SYNOCOMMUNITY.RRManager.Overview.Main",
    defaultWinSize: { width: 1160, height: 620 },
    constructor: function (config) {
        const t = this;
        t.callParent([t.fillConfig(config)]);
    },
    fillConfig: function (e) {
        let t;
        t = this.getListItems();
        const i = {
            cls: "syno-app-iscsi",
            width: this.defaultWinSize.width,
            height: this.defaultWinSize.height,
            minWidth: this.defaultWinSize.width,
            minHeight: this.defaultWinSize.height,
            activePage: "SYNOCOMMUNITY.RRManager.Overview.Main",
            listItems: t,
        };
        return Ext.apply(i, e), i;

    },
    getListItems: function () {
        return [
            {
                text: this.helper.V('ui', 'tab_general'),
                iconCls: "icon-overview",
                fn: "SYNOCOMMUNITY.RRManager.Overview.Main",
                // help: "overview.html",
            },
            {
                text: this.helper.V('ui', 'tab_addons'),
                iconCls: "icon-log",
                fn: "SYNOCOMMUNITY.RRManager.Addons.Main",
                // help: "overview.html",
            },
            {
                text: this.helper.V('ui', 'tab_configuration'),
                iconCls: "icon-settings",
                fn: "SYNOCOMMUNITY.RRManager.Setting.Main",
                // help: "setting.html",
            },
            {
                text: this.helper.V('ui', 'tab_debug'),
                iconCls: "icon-debug",
                fn: "SYNOCOMMUNITY.RRManager.Debug.Main",
                // help: "setting.html",
            },
        ];
    },

    onOpen: function (a) {
        SYNOCOMMUNITY.RRManager.AppWindow.superclass.onOpen.call(this, a);
    }
});