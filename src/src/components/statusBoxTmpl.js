export default 
Ext.define("SYNOCOMMUNITY.RRManager.Overview.StatusBoxTmpl", {
    extend: "Ext.XTemplate",
    _V: function (category, element) {
        return _TT("SYNOCOMMUNITY.RRManager.AppInstance", category, element)
    },

    formatString: function (str, ...args) {
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },
    constructor: function (e) {
        const t = this.createTpl();
        t.push(this.fillConfig(e)), this.callParent(t);
    },
    fillConfig: function (e) {
        const templateConfig = { compiled: true, disableFormats: true },
            translations = {};

        return (
            {
                getTranslate: (key) => translations[key],
                getStatusText: (type, status) => {
                    const statusTexts = {
                        'fctarget': translations.status.fctarget[status],
                        'target': translations.status.target[status],
                        'lun': translations.status.lun[status],
                        'event': translations.status.event[status]
                    };
                    return statusTexts[type];
                },
                isBothErrorWarn: (error, warning) => error !== 0 && warning !== 0,
                showNumber: (number) => number > 99 ? '99+' : number
            },
            Ext.apply(templateConfig, e)
        );
    },
    createTpl: function () {
        return [
            '<div class="iscsi-overview-statusbox iscsi-overview-statusbox-{type} iscsi-overview-statusbox-{errorlevel} iscsi-overview-statusbox-{clickType}">',
            '<div class="statusbox-titlebar"></div>',
            '<div class="statusbox-box">',
            '<div class="statusbox-title">',
            "<h3>{[ this.getTranslate(values.type) ]}</h3>",
            "</div>",
            '<div class="statusbox-title-right">',
            "<h3>{[ this.showNumber(values.total) ]}</h3>",
            "</div>",
            '<div class="x-clear"></div>',
            '<div class="statusbox-title-padding">',
            "</div>",
            '<tpl if="this.isBothErrorWarn(error, warning)">',
            '<div class="statusbox-halfblock-left statusbox-block-error">',
            '<div class="statusbox-number">{[ this.showNumber(values.error) ]}</div>',
            '<div class="statusbox-text" ext:qtip="{[ this.getStatusText(values.type, "error") ]}">{[ this.getStatusText(values.type, "error") ]}</div>',
            "</div>",
            '<div class="statusbox-halfblock-right statusbox-block-warning">',
            '<div class="statusbox-number">{[ this.showNumber(values.warning) ]}</div>',
            '<div class="statusbox-text" ext:qtip="{[ this.getStatusText(values.type, "warning") ]}">{[ this.getStatusText(values.type, "warning") ]}</div>',
            "</div>",
            "</tpl>",
            '<tpl if="! this.isBothErrorWarn(error, warning)">',
            '<div class="statusbox-block statusbox-block-{errorlevel}">',
            '<div class="statusbox-number">{[ this.showNumber(values[values.errorlevel]) ]}</div>',
            '<div class="statusbox-text" ext:qtip="{[ this.getStatusText(values.type, values.errorlevel) ]}">{[ this.getStatusText(values.type, values.errorlevel) ]}</div>',
            "</div>",
            "</tpl>",
            "</div>",
            "</div>",
        ];
    },
});