
// Namespace definition
Ext.ns('SYNOCOMMUNITY.RRManager');

// Application definition
Ext.define('SYNOCOMMUNITY.RRManager.AppInstance', {
    extend: 'SYNO.SDS.AppInstance',
    appWindowName: 'SYNOCOMMUNITY.RRManager.AppWindow',
    constructor: function () {
        this.callParent(arguments)
    }
});

// Window definition
Ext.define('SYNOCOMMUNITY.RRManager.AppWindow', {
    // Translator
    _V: function (category, element) {
        return _TT("SYNOCOMMUNITY.RRManager.AppInstance", category, element)
    },

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
                text: this._V('ui', 'tab_general'),
                iconCls: "icon-overview",
                fn: "SYNOCOMMUNITY.RRManager.Overview.Main",
                // help: "overview.html",
            },
            {
                text: this._V('ui', 'tab_addons'),
                iconCls: "icon-log",
                fn: "SYNOCOMMUNITY.RRManager.Addons.Main",
                // help: "overview.html",
            },
        ];
    },

    onOpen: function (a) {
        var that = this;
        SYNOCOMMUNITY.RRManager.AppWindow.superclass.onOpen.call(this, a);
    }
});



//Overview tab
Ext.define("SYNOCOMMUNITY.RRManager.Overview.Main", {
    extend: "SYNO.ux.Panel",
    constructor: function (e) {
        (this.loaded = !1), this.callParent([this.fillConfig(e)]);
    },
    fillConfig: function (e) {
        this.panels = {
            // healthPanel: new SYNOCOMMUNITY.RRManager.Overview.HealthPanel({
            //     appWin: e.appWin,
            //     owner: this,
            // }),
            // statusBoxsPanel: new SYNO.SDS.iSCSI.Overview.StatusBoxsPanel({
            //     appWin: e.appWin,
            //     owner: this,
            // }),
            // detailPanel: new SYNO.SDS.iSCSI.Overview.DetailTabPanel({
            //     appWin: e.appWin,
            //     owner: this,
            //     flex: 1,
            // }),
        };
        const t = {
            layout: "vbox",
            cls: "blue-border",
            layoutConfig: { align: "stretch" },
            items: Object.values(this.panels),
            listeners: {
                scope: this,
                activate: this.onActivate,
                deactivate: this.onDeactive,
                data_ready: this.onDataReady,
            },
        };
        return Ext.apply(t, e), t;
    },
    onActivate: function () {
        debugger
        const e = this;
        // e.panels.detailPanel.fireEvent(
        //     "select",
        //     e.panels.statusBoxsPanel.clickedBox
        // ),
        //     e.loaded || e.appWin.setStatusBusy(null, null, 50),
        //     e.appWin.fireEvent("poll_activate");
    },
    onDeactive: function () {
        // this.panels.detailPanel.fireEvent(
        //     "deactivate",
        //     this.panels.statusBoxsPanel.clickedBox
        // );
    },
    onDataReady: function () {
        const e = this;
        // e.loaded || (e.appWin.clearStatusBusy(), (e.loaded = !0)),
        //     e.panels.healthPanel.fireEvent("data_ready"),
        //     e.panels.statusBoxsPanel.fireEvent("data_ready"),
        //     e.panels.detailPanel.fireEvent(
        //         "data_ready",
        //         e.panels.statusBoxsPanel.clickedBox
        //     );
    },
});

Ext.define("SYNOCOMMUNITY.RRManager.Overview.StatusBoxTmpl", {
    extend: "Ext.XTemplate",
    constructor: function (e) {
        const t = this.createTpl();
        t.push(this.fillConfig(e)), this.callParent(t);
    },
    fillConfig: function (e) {
        const t = { compiled: !0, disableFormats: !0 },
            i = {
                fctarget: SYNO.SDS.iSCSI.Utils.T("san_fibre", "fibre_channel"),
                target: "iSCSI",
                lun: "LUN",
                event: SYNO.SDS.iSCSI.Utils.T("schedule", "event"),
                status: {
                    fctarget: {
                        healthy: SYNO.SDS.iSCSI.Utils.T(
                            "iscsitrg",
                            "iscsitrg_status_connected"
                        ),
                        warning: SYNO.SDS.iSCSI.Utils.T("log", "warn_level"),
                    },
                    target: {
                        healthy: SYNO.SDS.iSCSI.Utils.T(
                            "iscsitrg",
                            "iscsitrg_status_connected"
                        ),
                        warning: SYNO.SDS.iSCSI.Utils.T("log", "warn_level"),
                    },
                    lun: {
                        healthy: SYNO.SDS.iSCSI.Utils.T("iscsilun", "healthy"),
                        warning: SYNO.SDS.iSCSI.Utils.T("log", "warn_level"),
                        error: SYNO.SDS.iSCSI.Utils.T(
                            "disk_info",
                            "disk_status_critical"
                        ),
                    },
                    event: {
                        healthy: SYNO.SDS.iSCSI.Utils.T("iscsimgr", "unread"),
                        warning: SYNO.SDS.iSCSI.Utils.T("iscsimgr", "unread_warn"),
                        error: SYNO.SDS.iSCSI.Utils.T("iscsimgr", "unread_crit"),
                    },
                },
            };
        return (
            (t.getTranslate = (e) => i[e]),
            (t.getStatusText = (e, t) =>
                "fctarget" === e
                    ? i.status.fctarget[t]
                    : "target" === e
                        ? i.status.target[t]
                        : "lun" === e
                            ? i.status.lun[t]
                            : "event" === e
                                ? i.status.event[t]
                                : void 0),
            (t.isBothErrorWarn = (e, t) => 0 !== e && 0 !== t),
            (t.showNumber = (e) => (e > 99 ? "99+" : e)),
            Ext.apply(t, e)
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
        const e = this,
            t = e.appWin.fcTargets.getAll();
        (e.data.total = 0),
            Ext.each(
                t,
                (t) => {
                    e.data.total++,
                        "connected" === t.get("status")
                            ? e.data.healthy++
                            : t.get("is_enabled") ||
                            !1 !== t.get("status") ||
                            e.data.warning++;
                },
                e
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
Ext.define("SYNOCOMMUNITY.RRManager.Overview.StatusBoxsPanel", {
    extend: "SYNO.ux.Panel",
    constructor: function (e) {
        this.callParent([this.fillConfig(e)]);
    },
    fillConfig: function (e) {
        const t = { owner: this, appWin: e.appWin, flex: 1 };
        (this.clickedBox = "lun"),
            (this.statusBoxs = [
                new SYNOCOMMUNITY.RRManager.Overview.StatusBox(
                    Ext.apply({ type: "lun", title: "LUN", storeKey: "lun_summ" }, t)
                ),
                new SYNO.ux.Panel({ width: 10 }),
                new SYNOCOMMUNITY.RRManager.Overview.StatusBox(
                    Ext.apply(
                        { type: "target", title: "Target", storeKey: "target_summ" },
                        t
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
                        t
                    )
                ),
                new SYNO.ux.Panel({ width: 10 }),
                new SYNOCOMMUNITY.RRManager.Overview.StatusBox(
                    Ext.apply(
                        {
                            type: "event",
                            title: SYNO.SDS.iSCSI.Utils.T("schedule", "event"),
                            storeKey: "event_summ",
                        },
                        t
                    )
                ),
            ]),
            e.appWin.supportFC || this.statusBoxs.splice(4, 2);
        const i = {
            cls: "iscsi-overview-status-panel",
            layout: "hbox",
            layoutConfig: { align: "stretch" },
            items: this.statusBoxs,
            listeners: {
                scope: this,
                selectchange: this.onSelectChange,
                data_ready: this.onDataReady,
            },
        };
        return Ext.apply(i, e), i;
    },
    onSelectChange: function (e) {
        (this.clickedBox = e),
            Ext.each(this.statusBoxs, (e) => {
                e.fireEvent("update");
            }),
            this.owner.panels.detailPanel.fireEvent("select", e);
    },
    onDataReady: function () {
        Ext.each(this.statusBoxs, (e) => {
            e.fireEvent("data_ready");
        });
    },
}),

    //Addons tab
    Ext.define("SYNOCOMMUNITY.RRManager.Addons.Main", {
        extend: "SYNO.ux.GridPanel",
        itemsPerPage: 1e3,
        constructor: function (e) {
            const t = this;
            let i;
            Ext.apply(t, e),
                (i = t.fillConfig(e)),
                (t.itemsPerPage =
                    t.appWin.appInstance.getUserSettings(t.itemId + "-dsPageLimit") ||
                    t.itemsPerPage),
                t.callParent([i]),
                t.mon(
                    t,
                    "resize",
                    (e, i, s) => {
                        t.updateFbarItems(i);
                    },
                    t
                );
        },
        getPageRecordStore: function () {
            return new Ext.data.SimpleStore({
                fields: ["value", "display"],
                data: [
                    [100, 100],
                    [500, 500],
                    [1e3, 1e3],
                    [3e3, 3e3],
                ],
            });
        },
        getCategoryStore: function () {
            return new Ext.data.SimpleStore({
                fields: ["value", "display"],
                data: [
                    ["", SYNO.SDS.iSCSI.Utils.T("log", "log_all")],
                    ["general", SYNO.SDS.iSCSI.Utils.T("log", "general")],
                    ["connection", SYNO.SDS.iSCSI.Utils.T("log", "log_link_connection")],
                ],
            });
        },
        onChangeDisplayRecord: function (e, t, i) {
            const s = this,
                n = s.logStore;
            s.itemsPerPage !== e.getValue() &&
                ((s.itemsPerPage = e.getValue()),
                    (s.paging.pageSize = s.itemsPerPage),
                    n.load({ params: { offset: 0, limit: s.itemsPerPage } }),
                    s.appWin.appInstance.setUserSettings(
                        s.itemId + "-dsPageLimit",
                        s.itemsPerPage
                    ));
        },
        onChangeCategory: function (e, t, i) {
            const s = this,
                n = s.logStore,
                a = e.getValue();
            a !== n.baseParams.category &&
                (Ext.apply(n.baseParams, { category: a }), s.loadData());
        },
        initPageComboBox: function (e) {
            return new SYNO.ux.ComboBox({
                name: "page_rec",
                hiddenName: "page_rec",
                hiddenId: Ext.id(),
                store: e,
                displayField: "display",
                valueField: "value",
                triggerAction: "all",
                value: this.itemsPerPage,
                editable: !1,
                width: 72,
                mode: "local",
                listeners: { select: { fn: this.onChangeDisplayRecord, scope: this } },
            });
        },
        initCategoryComboBox: function (e) {
            return new SYNO.ux.ComboBox({
                name: "category",
                store: e,
                displayField: "display",
                valueField: "value",
                value: "",
                width: 120,
                mode: "local",
                listeners: { select: { fn: this.onChangeCategory, scope: this } },
            });
        },
        initPagingToolbar: function () {
            return new SYNO.ux.PagingToolbar({
                store: this.logStore,
                displayInfo: !0,
                pageSize: this.itemsPerPage,
                showRefreshBtn: !0,
                cls: "iscsi-log-toolbar",
                items: [
                    {
                        xtype: "tbtext",
                        style: "padding-right: 4px",
                        text: SYNO.SDS.iSCSI.Utils.T("common", "items_perpage"),
                    },
                    this.initPageComboBox(this.getPageRecordStore()),
                ],
            });
        },
        initSearchForm: function () {
            // return new SYNO.SDS.iSCSI.SearchFormPanel({
            //     cls: "iscsi-search-panel",
            //     renderTo: Ext.getBody(),
            //     shadow: !1,
            //     hidden: !0,
            //     owner: this,
            // });
        },
        initToolbar: function () {
            // const e = this,
            //     t = new SYNO.ux.Toolbar();
            // return (
            //     (e.clearButton = new SYNO.ux.Button({
            //         xtype: "syno_button",
            //         text: SYNO.SDS.iSCSI.Utils.T("common", "btn_clear"),
            //         handler: e.onLogClear,
            //         scope: e,
            //     })),
            //     (e.exportButton = new SYNO.ux.SplitButton({
            //         xtype: "syno_splitbutton",
            //         text: SYNO.SDS.iSCSI.Utils.T("common", "btn_export"),
            //         handler: e.onExportHtml,
            //         scope: e,
            //         menu: {
            //             items: [
            //                 {
            //                     text: SYNO.SDS.iSCSI.Utils.T("log", "html_type"),
            //                     handler: e.onExportHtml,
            //                     scope: e,
            //                 },
            //                 {
            //                     text: SYNO.SDS.iSCSI.Utils.T("log", "csv_type"),
            //                     handler: e.onExportCSV,
            //                     scope: e,
            //                 },
            //             ],
            //         },
            //     })),
            //     (e.searchField = new SYNO.SDS.iSCSI.AdvancedSearchField({
            //         iconStyle: "filter",
            //         owner: e,
            //     })),
            //     (e.searchField.searchPanel = e.searchPanel),
            //     t.add(e.clearButton),
            //     t.add(e.exportButton),
            //     t.add("->"),
            //     t.add(e.initCategoryComboBox(e.getCategoryStore())),
            //     t.add({ xtype: "tbspacer", width: 4 }),
            //     t.add(e.searchField),
            //     t
            // );
            return [];
        },
        initEvents: function () {
            // this.mon(this.searchPanel, "search", this.onSearch, this),
            this.mon(this, "activate", this.onActive, this);
        },
        _getLng: function (lng) {
            const localeMapping = {
                'dan': 'da_DK', // Danish in Denmark
                'ger': 'de_DE', // German in Germany
                'enu': 'en_US', // English (United States)
                'spn': 'es_ES', // Spanish (Spain)
                'fre': 'fr_FR', // French in France
                'ita': 'it_IT', // Italian in Italy
                'hun': 'hu_HU', // Hungarian in Hungary
                'nld': 'nl_NL', // Dutch in The Netherlands
                'nor': 'no_NO', // Norwegian in Norway
                'plk': 'pl_PL', // Polish in Poland
                'ptg': 'pt_PT', // European Portuguese
                'ptb': 'pt_BR', // Brazilian Portuguese
                'sve': 'sv_SE', // Swedish in Sweden
                'trk': 'tr_TR', // Turkish in Turkey
                'csy': 'cs_CZ', // Czech in Czech Republic
                'gre': 'el_GR', // Greek in Greece
                'rus': 'uk-UA',
                'heb': 'he_IL', // Hebrew in Israel
                'ara': 'ar_SA', // Arabic in Saudi Arabia
                'tha': 'th_TH', // Thai in Thailand
                'jpn': 'ja_JP', // Japanese in Japan
                'chs': 'zh_CN', // Simplified Chinese in China
                'cht': 'zh_TW', // Traditional Chinese in Taiwan
                'krn': 'ko_KR', // Korean in Korea
                'vi': 'vi-VN', // Vietnam in Vietnam 
            };
            return Object.keys(localeMapping).indexOf(lng) > -1
                ? localeMapping[lng] : localeMapping['enu'];
        },
        getStore: function () {
            var gridStore = new SYNO.API.JsonStore({
                autoDestroy: true,
                appWindow: this.appWin,
                restful: true,
                root: "result",
                url: `/webman/3rdparty/rr-manager/getAddons.cgi`,
                idProperty: "name",
                fields: [{
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'version',
                    type: 'string'
                }, {
                    name: 'description',
                    type: 'object'
                }, {
                    name: 'system',
                    type: 'boolean'
                }, {
                    name: 'installed',
                    type: 'boolean'
                }],
                // reader: new Ext.data.JsonReader({
                //     idProperty: "name",

                //     totalProperty: "total",
                //     fields: [{
                //         name: 'name', type: 'string',mapping: 'name'
                //     }, {
                //         name: 'version', type: 'string',mapping: 'version'
                //     }, {
                //         name: 'description', type: 'object',mapping: 'description'
                //     }, {
                //         name: 'system', type: 'boolean',mapping: 'system'
                //     }, {
                //         name: 'installed', type: 'boolean',mapping: 'installed'
                //     }]
                // }),
                listeners: {
                    exception: this.loadException,
                    beforeload: this.onBeforeStoreLoad,
                    load: this.onAfterStoreLoad,
                    scope: this,
                }
            });
            return gridStore;
        },
        logLevelRenderer: function (e) {
            switch (e) {
                case "err":
                    return (
                        "<span class='red-status'>" +
                        SYNO.SDS.iSCSI.Utils.T("log", "error_level") +
                        "</span>"
                    );
                case "warning":
                    return (
                        "<span class='orange-status'>" +
                        SYNO.SDS.iSCSI.Utils.T("log", "warn_level") +
                        "</span>"
                    );
                case "info":
                    return (
                        "<span class='iscsi-log-text-info'>" +
                        SYNO.SDS.iSCSI.Utils.T("log", "info_level") +
                        "</span>"
                    );
                default:
                    return "Undefined";
            }
        },
        htmlTimeRender: function (e) {
            const t = new Date(1e3 * e);
            return SYNO.SDS.DateTimeFormatter(t, { type: "datetimesec" });
        },
        getColumnModel: function () {
            var currentLngCode = this._getLng(SYNO?.SDS?.Session?.lang || "enu");
            return new Ext.grid.ColumnModel({
                columns: [
                    {
                        header: 'Name',
                        width: 60,
                        dataIndex: 'name'
                    }, {
                        header: 'Verison',
                        width: 30,
                        dataIndex: 'version'
                    }, {
                        header: 'Description',
                        width: 300,
                        dataIndex: 'description',
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            return value[currentLngCode] ?? value['en_US'];
                        }
                    }, new SYNO.ux.EnableColumn({
                        header: "System",
                        dataIndex: "system",
                        width: 100,
                        align: "center",
                        enableFastSelectAll: false,
                        disabled: true,
                    }), new SYNO.ux.EnableColumn({
                        header: "Installed",
                        dataIndex: "installed",
                        width: 100,
                        align: "center",
                        enableFastSelectAll: false,
                        disabled: true,
                    }),
                ],
                defaults: { sortable: !1, menuDisabled: !1 },
            });
        },
        fillConfig: function (e) {
            const t = this;
            (t.searchPanel = t.initSearchForm()),
                (t.logStore = t.getStore()),
                (t.paging = t.initPagingToolbar());
            const i = {
                border: !1,
                trackResetOnLoad: !0,
                layout: "fit",
                itemId: "iscsi_log",
                tbar: t.initToolbar(),
                enableColumnMove: !1,
                enableHdMenu: !1,
                bbar: t.paging,
                store: t.logStore,
                colModel: t.getColumnModel(),
                view: new SYNO.ux.FleXcroll.grid.BufferView({
                    rowHeight: 27,
                    scrollDelay: 30,
                    borderHeight: 1,
                    emptyText: SYNO.SDS.iSCSI.Utils.EmptyMsgRender(
                        SYNO.SDS.iSCSI.Utils.T("log", "no_log_available")
                    ),
                    templates: {
                        cell: new Ext.XTemplate(
                            '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} x-selectable {css}" style="{style}" tabIndex="-1" {cellAttr}>',
                            '<div class="{this.selectableCls} x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>',
                            "</td>",
                            { selectableCls: SYNO.SDS.Utils.SelectableCLS }
                        ),
                    },
                }),
                loadMask: !0,
                stripeRows: !0,
            };
            return Ext.apply(i, e), i;
        },
        isBelong: function (e, t) {
            let i;
            for (i in t) if (t[i] !== e[i]) return !1;
            return !0;
        },
        isTheSame: function (e, t) {
            return this.isBelong(e, t) && this.isBelong(t, e);
        },
        onSearch: function (e, t) {
            const i = this,
                s = i.logStore;
            if (!i.isTheSame(s.baseParams, t)) {
                const e = ["date_from", "date_to", "keyword", "log_level"];
                if (
                    (t.date_from &&
                        (t.date_from =
                            Date.parseDate(
                                t.date_from,
                                SYNO.SDS.DateTimeUtils.GetDateFormat()
                            ) / 1e3),
                        t.date_to)
                ) {
                    const e = Date.parseDate(
                        t.date_to,
                        SYNO.SDS.DateTimeUtils.GetDateFormat()
                    );
                    e.setDate(e.getDate() + 1), (t.date_to = e / 1e3 - 1);
                }
                e.forEach((e) => {
                    s.baseParams[e] = t[e];
                }),
                    i.loadData();
            }
            i.searchField.searchPanel.hide();
        },
        setUnread: function () {
            this.sendWebAPI({
                api: "SYNO.Core.ISCSI.Node",
                version: 1,
                method: "log_list",
                params: { additional: ["update_unread"] },
                scope: this,
            });
        },
        onActive: function () {
            this.loadData();//, this.setUnread();
        },
        enableButtonCheck: function () {
            this.logStore.getTotalCount()
                ? (this.exportButton.enable(), this.clearButton.enable())
                : (this.exportButton.disable(), this.clearButton.disable());
        },
        loadData: function () {
            const e = this.logStore;
            const t = { offset: 0, limit: this.itemsPerPage };
            e.load({ params: t });
            this.enableButtonCheck();
        },
        loadException: function () {
            this.appWin.clearStatusBusy(), this.setMask(!0);
        },
        onBeforeStoreLoad: function (e, t) {
            this.appWin.setStatusBusy();
        },
        onAfterStoreLoad: function (e, t, i) {

            const s = this;
            s.appWin.clearStatusBusy(),
                t.length < 1 ? s.setMask(!0) : s.setMask(!1),
                s.setPagingToolbar(e, s.paging),
                this.enableButtonCheck();
        },
        setMask: function (e) {
            SYNO.SDS.iSCSI.Utils.SetEmptyIcon(this, e);
        },
        setPagingToolbar: function (e, t) {
            this.setPagingToolbarVisible(t, e.getTotalCount() > this.itemsPerPage);
        },
        setPagingToolbarVisible: function (e, t) {
            e.setButtonsVisible(!0);
        },
        updateFbarItems: function (e) {
            this.isVisible();
        },
        onClearLogDone: function (e, t, i, s) {
            e
                ? this.loadData()
                : this.appWin
                    .getMsgBox()
                    .alert(
                        this.appWin.title,
                        SYNO.SDS.iSCSI.Utils.T("common", "error_system")
                    ),
                this.appWin.clearStatusBusy();
        },
        onLogClear: function () {
            const e = this;
            e.appWin.getMsgBox().confirmDelete(
                e.appWin.title,
                SYNO.SDS.iSCSI.Utils.T("log", "log_cfrm_clear"),
                (t) => {
                    "yes" === t &&
                        (e.appWin.setStatusBusy(),
                            e.appWin.sendWebAPI({
                                api: "SYNO.Core.ISCSI.Node",
                                version: 1,
                                method: "log_clear",
                                callback: e.onClearLogDone,
                                scope: e,
                            }));
                },
                e,
                {
                    yes: {
                        text: SYNO.SDS.iSCSI.Utils.T("common", "btn_clear"),
                        btnStyle: "red",
                    },
                    no: { text: Ext.MessageBox.buttonText.no },
                }
            );
        },
        onExportCSV: function () {
            this.onLogSave("csv");
        },
        onExportHtml: function () {
            this.onLogSave("html");
        },
        onLogSave: function (e) {
            _S("demo_mode")
                ? this.appWin
                    .getMsgBox()
                    .alert(this.appWin.title, _JSLIBSTR("uicommon", "error_demo"))
                : this.saveLog(e);
        },
        saveLog: function (e) {
            const t = this,
                i = t.logStore,
                s = { export_format: e };
            Ext.apply(s, i.baseParams),
                t.downloadWebAPI({
                    webapi: {
                        version: 1,
                        api: "SYNO.Core.ISCSI.Node",
                        method: "log_export",
                        params: s,
                    },
                    scope: t,
                });
        },
        destroy: function () {
            this.rowNav && (Ext.destroy(this.rowNav), (this.rowNav = null)),
                this.searchField && this.searchField.fireEvent("destroy"),
                this.callParent([this]);
        },
    });
