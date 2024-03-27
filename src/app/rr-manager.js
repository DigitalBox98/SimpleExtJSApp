
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
            {
                text: "Configuration",
                iconCls: "icon-settings",
                fn: "SYNOCOMMUNITY.RRManager.Setting.Main",
                // help: "setting.html",
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
    _V: function (category, element) {
        return _TT("SYNOCOMMUNITY.RRManager.AppInstance", category, element)
    },

    formatString: function (str, ...args) {
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },

    constructor: function (e) {
        const t = this;
        (this.loaded = !1),
            t.callParent([t.fillConfig(e)]),
            t.mon(
                t,
                "data_ready",
                () => {
                    if (t?.getActivePage)
                        t?.getActivePage()?.fireEvent("data_ready");
                },
                t
            );
    },
    fillConfig: function (e) {
        this.panels = {
            healthPanel: new SYNOCOMMUNITY.RRManager.Overview.HealthPanel({
                appWin: e.appWin,
                owner: this,
            }),
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
        const e = this;
        (async () => {
            // e.loaded = false;
            var systemInfo = await e.getSytemInfo();
            var packages = await e.getPackagesList();
            if (systemInfo && packages) {
                e.systemInfoTxt = `Model: ${systemInfo?.model}, RAM: ${systemInfo?.ram} MB, DSM version: ${systemInfo?.version_string} `;
                var rrManagerPackage = packages.packages.find(p => p.id == 'rr-manager');
                e.rrManagerVersionText = `🛡️RR Manager v.: ${rrManagerPackage?.version}`;
                // e.loaded = true;
                e.panels.healthPanel.fireEvent(
                    "select",
                    e.panels.healthPanel.clickedBox
                ),
                    e.panels.healthPanel.fireEvent("data_ready", function () {
                    })
                e.loaded || e.appWin.setStatusBusy(null, null, 50),
                    e.appWin.fireEvent("poll_activate");
                this.updateAllForm();
            }
        })();
    },
    opts: {
        params: {
            path: ""
        }
    },
    getUpdateFileInfo: function (file) {
        return new Promise((resolve, reject) => {
            Ext.Ajax.request({
                url: `${this._prefix}readUpdateFile.cgi`,
                method: 'GET',
                timeout: 60000,
                params: {
                    file: file
                },
                headers: {
                    'Content-Type': 'text/html'
                },
                success: function (response) {
                    // if response text is string need to decode it
                    if (typeof response?.responseText === 'string' && response?.responseText != "") {
                        resolve(Ext.decode(response?.responseText));
                    } else {
                        resolve(response?.responseText);
                    }
                },
                failure: function (result) {
                    if (typeof result?.responseText === 'string' && result?.responseText) {
                        var response = Ext.decode(result?.responseText);
                        reject(response?.error);
                    }
                    else {
                        reject('Failed with status: ' + response?.status);
                    }
                }
            });
        });
    },
    runTask: function (taskName) {
        that = this;
        return new Promise((resolve, reject) => {
            let params = {
                task_name: taskName
            };
            let args = {
                api: 'SYNO.Core.EventScheduler',
                method: 'run',
                version: 1,
                params: params,
                stop_when_error: false,
                mode: 'sequential',
                callback: function (success, message) {
                    success ? resolve(message) : reject('Unable to get packages!');
                }
            };
            that.sendWebAPI(args);
        });
    },
    onRunRrUpdateManuallyClick: function () {
        that = this;

        showMsg = function (msg) {
            that.owner.getMsgBox().alert("title", msg);
        }
        var rrConfig = this.owner.rrManagerConfig;
        var url = `${rrConfig?.UPLOAD_DIR_PATH}${rrConfig?.RR_TMP_DIR}/update.zip`;
        // var tabs = Ext.getCmp('tabsControl');
        this.getUpdateFileInfo(url).then((responseText) => {
            if (!responseText.success) {
                that.owner.getEl()?.unmask();
                showMsg('title', that.formatString(that._V('ui', 'unable_update_rr_msg'), responseText?.error ?? "No response from the readUpdateFile.cgi script."));
                return;
            }
            var configName = 'rrUpdateFileVersion';
            that.owner[configName] = responseText;
            let currentRrVersion = that.owner["rrConfig"]?.rr_version;
            let updateRrVersion = that.owner[configName].updateVersion;

            async function runUpdate() {
                //show the spinner
                that.owner.getEl().mask(_T("common", "loading"), "x-mask-loading");
                that.runTask('RunRrUpdate');
                var maxCountOfRefreshUpdateStatus = 350;
                var countUpdatesStatusAttemp = 0;

                var updateStatusInterval = setInterval(async function () {
                    var checksStatusResponse = await that.callCustomScript('checkUpdateStatus.cgi?filename=rr_update_progress');
                    if (!checksStatusResponse?.success) {
                        clearInterval(updateStatusInterval);
                        that.owner.getEl()?.unmask();
                        showMsg(checksStatusResponse?.status);
                    }
                    var response = checksStatusResponse.result;
                    that.owner.getEl()?.mask(that.formatString(that._V('ui', 'update_rr_progress_msg'), response?.progress ?? "--", response?.progressmsg ?? "--"), 'x-mask-loading');
                    countUpdatesStatusAttemp++;
                    if (countUpdatesStatusAttemp == maxCountOfRefreshUpdateStatus || response?.progress?.startsWith('-')) {
                        clearInterval(updateStatusInterval);
                        that.owner.getEl()?.unmask();
                        showMsg(that.formatString(that._V('ui'), response?.progress, response?.progressmsg));
                    } else if (response?.progress == '100') {
                        that.owner.getEl()?.unmask();
                        clearInterval(updateStatusInterval);
                        showMsg(that._V('ui', 'update_rr_completed'));
                    }
                }, 1500);
            }
            that.appWin.getMsgBox().confirmDelete("title", that.formatString(that._V('ui', 'update_rr_confirmation'), currentRrVersion, updateRrVersion),
                (t) => {
                    if ("yes" === t) {
                        runUpdate();
                    }
                },
                e,
                {
                    yes: {
                        text: "Yes",
                        btnStyle: "red",
                    },
                    no: { text: Ext.MessageBox.buttonText.no },
                });
        }).catch(error => {
            showMsg(`Error. ${error}`);
        });
    },
    updateAllForm: async function () {
        that = this.appWin;
        this.owner.setStatusBusy();
        try {
            const responseText = await this.getConf();
            var configName = 'rrConfig';
            that[configName] = responseText;
            localStorage.setItem(configName, JSON.stringify(responseText));
            //populate rr config path
            that['rrManagerConfig'] = that[configName]['rr_manager_config'];
            this.opts.params.path = `/${that['rrManagerConfig']['SHARE_NAME']}/${that['rrManagerConfig']['RR_TMP_DIR']}`;
            // this.loadAllForms(e), this.updateEnv(e);
        } catch (e) {
            SYNO.Debug(e);
        } finally {
            this.owner.clearStatusBusy();
        }
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
    getConf: function () {
        return this.callCustomScript('getConfig.cgi')
    },
    onDeactive: function () {
        this.panels.healthPanel.fireEvent(
            "deactivate",
            this.panels.healthPanel.clickedBox
        );
    },
    getSytemInfo: function () {
        that = this;
        return new Promise((resolve, reject) => {
            let args = {
                api: 'SYNO.DSM.Info',
                method: 'getinfo',
                version: 2,
                callback: function (success, message) {
                    success ? resolve(message) : reject('Unable to get getSytemInfo!');
                }
            };
            that.sendWebAPI(args);
        });
    },
    getPackagesList: function () {
        that = this;
        return new Promise((resolve, reject) => {
            let params = {
                additional: ["description", "description_enu", "dependent_packages", "beta", "distributor", "distributor_url", "maintainer", "maintainer_url", "dsm_apps", "dsm_app_page", "dsm_app_launch_name", "report_beta_url", "support_center", "startable", "installed_info", "support_url", "is_uninstall_pages", "install_type", "autoupdate", "silent_upgrade", "installing_progress", "ctl_uninstall", "updated_at", "status", "url", "available_operation", "install_type"],
                ignore_hidden: false,
            };
            let args = {
                api: 'SYNO.Core.Package',
                method: 'list',
                version: 2,
                params: params,
                callback: function (success, message) {
                    success ? resolve(message) : reject('Unable to get packages!');
                }
            };
            that.sendWebAPI(args);
        });
    },
    onDataReady: function () {
        const e = this;
        console.log("--onDataReady1");
        (async () => {
            // e.loaded = false;
            e.systemInfo = await e.getSytemInfo();
            e.packages = await e.getPackagesList();

            e.loaded = true;
            e.appWin.clearStatusBusy();
            if (!e.loaded || e.loaded !== true) {
                e.panels.healthPanel.fireEvent("data_ready");
            }
        })();
    },
});

Ext.define("SYNOCOMMUNITY.RRManager.Overview.HealthPanel", {
    extend: "SYNO.ux.Panel",
    _V: function (category, element) {
        return _TT("SYNOCOMMUNITY.RRManager.AppInstance", category, element)
    },

    formatString: function (str, ...args) {
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },

    constructor: function (e) {
        this.callParent([this.fillConfig(e)]);
    },
    onDataReady: function () {
        let s = "normal";
        this.iconTpl.overwrite(this.getComponent("icon").getEl(), { status: s }),
            this.titleTpl.overwrite(this.upperPanel.getComponent("title").getEl(), {
                status: s,
            }),
            this.updateDesc("cur");
        this.owner.fireEvent("data_ready");
    },
    createUploadPannel: function () {
        var myFormPanel = new Ext.form.FormPanel({
            title: this._V("ui", "lb_select_update_file"),
            fileUpload: true,
            name: 'upload_form',
            border: !1,
            bodyPadding: 10,
            items: [{
                xtype: 'syno_filebutton',
                text: this._V('ui', 'select_file'),
                name: 'filename',
                allowBlank: false,
            }],
        });
        this["upload_form"] = myFormPanel;
        return myFormPanel;
    },
    _baseUrl: 'webapi/entry.cgi?',
    sendArray: function (e, t, i, o, r) {
        var that = this;
        if ("CANCEL" !== t.status) {
            var n, s = {}, l = {};
            if (!0 === t.chunkmode)
                if (l = {
                    "Content-Type": "multipart/form-data; boundary=" + e.boundary
                },
                    s = {
                        "X-TYPE-NAME": "SLICEUPLOAD",
                        "X-FILE-SIZE": t.size,
                        "X-FILE-CHUNK-END": 1 > o.total || o.index === o.total - 1 ? "true" : "false"
                    },
                    r && Ext.apply(s, {
                        "X-TMP-FILE": r
                    }),
                    window.XMLHttpRequest.prototype.sendAsBinary)
                    n = e.formdata + ("" !== i ? i : "") + "\r\n--" + e.boundary + "--\r\n";
                else if (window.Blob) {
                    var a, d = 0, p = 0, h = 0, c = "\r\n--" + e.boundary + "--\r\n", f = e.formdata.length + c.length;
                    for (h = Ext.isString(i) ? i.length : new Uint8Array(i).byteLength,
                        a = new Uint8Array(f += h),
                        d = 0; d < e.formdata.length; d++)
                        a[d] = e.formdata.charCodeAt(d);
                    if (Ext.isString(i))
                        for (p = 0; p < i.length; p++)
                            a[d + p] = i.charCodeAt(p);
                    else
                        a.set(new Uint8Array(i), d);
                    for (d += h,
                        p = 0; p < c.length; p++)
                        a[d + p] = c.charCodeAt(p);
                    n = a
                } else {
                    var u;
                    window.MSBlobBuilder ? u = new MSBlobBuilder : window.BlobBuilder && (u = new BlobBuilder),
                        u.append(e.formdata),
                        "" !== i && u.append(i),
                        u.append("\r\n--" + e.boundary + "--\r\n"),
                        n = u.getBlob(),
                        u = null
                }
            else
                e.append("size", t.size),
                    t.name ? e.append(this.opts.filefiledname, t, this.opts.params.fileName) : e.append(this.opts.filefiledname, t.file),
                    n = e;
            this.conn = new Ext.data.Connection({
                method: 'POST',
                url: `${this._baseUrl}api=SYNO.FileStation.Upload&method=upload&version=2&SynoToken=${localStorage['SynoToken']}`,
                defaultHeaders: l,
                timeout: null
            });
            // var tabs = Ext.getCmp('tabsControl');
            var m = this.conn.request({
                headers: s,
                html5upload: !0,
                chunkmode: t.chunkmode,
                uploadData: n,
                success: (x) => {
                    that.appWin.clearStatusBusy();
                    that.appWin.getMsgBox().confirmDelete(
                        that.appWin.title,
                        that._V('ui', 'file_uploading_succesfull_msg'),
                        (t) => {
                            if ("yes" === t) {
                                var c = that.owner.onRunRrUpdateManuallyClick.bind(that.owner);
                                c();
                            }
                        },
                        e,
                        {
                            yes: {
                                text: "Yes",
                                btnStyle: "red",
                            },
                            no: { text: Ext.MessageBox.buttonText.no },
                        }
                    );
                },
                failure: (x) => {
                    that.appWin.clearStatusBusy();
                    that.showMsg("title", "Error file uploading.");
                    console.log(x);
                },
                progress: (x) => { },
            });
        }
    },
    MAX_POST_FILESIZE: Ext.isWebKit ? -1 : window.console && window.console.firebug ? 20971521 : 4294963200,
    showUpdateUploadDialog: function () {
        that = this;
        var window = new SYNO.SDS.ModalWindow({
            id: "upload_file_dialog",
            title: this._V("ui", "upload_file_dialog_title"),
            width: 500,
            height: 400,
            resizable: false,
            layout: "fit",
            buttons: [
                {
                    xtype: "syno_button",
                    text: _T("common", "alt_cancel"),
                    scope: this,
                    handler: function () {
                        Ext.getCmp("upload_file_dialog")?.close();
                    },
                },
                {
                    xtype: "syno_button",
                    text: _T("common", "submit"),
                    btnStyle: "blue",
                    scope: this,
                    handler: function () {
                        const form = that["upload_form"].getForm();
                        var fileObject = form.el.dom[1].files[0];
                        if (!form.isValid()) {
                            that.showMsg('error', this._V('ui', 'upload_update_file_form_validation_invalid_msg'));
                            return;
                        }
                        this.appWin.setStatusBusy();
                        that.onUploadFile(fileObject, that);
                        Ext.getCmp("upload_file_dialog")?.close();
                    }
                },
            ],
            items: [
                this.createUploadPannel()
            ],
        });
        window.open();
    },
    onUploadFile: function (e, d) {
        that = d.appWin;
        //create rr tmp folder
        SYNO.API.currentManager.requestAPI('SYNO.FileStation.CreateFolder', "create", "2", {
            folder_path: `/${that['rrManagerConfig']['SHARE_NAME']}`,
            name: that['rrManagerConfig']['RR_TMP_DIR'],
            force_parent: false
        });
        //rename file to update.zip
        e = new File([e], this.opts.params.filename);
        var t, i = !1;
        if (-1 !== this.MAX_POST_FILESIZE && e.size > this.MAX_POST_FILESIZE && i)
            this.onError({
                errno: {
                    section: "error",
                    key: "upload_too_large"
                }
            }, e);
        else if (t = this.prepareStartFormdata(e), e.chunkmode) {
            var o = this.opts.chunksize,
                r = Math.ceil(e.size / o);
            this.onUploadPartailFile(t, e, {
                start: 0,
                index: 0,
                total: r
            })
        } else
            this.sendArray(t, e)
    },
    opts: {
        chunkmode: false,
        filefiledname: "file",
        file: function (t) {
            var FileObj = function (e, t, i, o) {
                var r = SYNO.SDS.copy(t || {})
                    , n = SYNO.webfm.utils.getLastModifiedTime(e);
                return n && (r = Ext.apply(r, {
                    mtime: n
                })),
                {
                    id: i,
                    file: e,
                    dtItem: o,
                    name: e.name || e.fileName,
                    size: e.size || e.fileSize,
                    progress: 0,
                    status: "NOT_STARTED",
                    params: r,
                    chunkmode: !1
                }
            }

            mtime = SYNO.webfm.utils.getLastModifiedTime(t);
            var i = new FileObj(t, { mtime: mtime });
            return i;
        },
        //TODO: remove hard coding
        params: {
            // populating from the config in onOpen
            path: '',
            filename: "update.zip",
            overwrite: true
        }
    },
    prepareStartFormdata: function (e) {
        e.chunkmode = (-1 !== this.MAX_POST_FILESIZE && e.size > this.MAX_POST_FILESIZE);
        if (this.opts.chunkmode) {
            var boundary = "----html5upload-" + (new Date).getTime().toString() + Math.floor(65535 * Math.random()).toString();
            var contentPrefix = "";

            if (this.opts.params)
                for (var paramName in this.opts.params) {
                    if (this.opts.params.hasOwnProperty(paramName)) {
                        contentPrefix += "--" + boundary + '\r\n';
                        contentPrefix += 'Content-Disposition: form-data; name="' + paramName + '"\r\n\r\n';
                        contentPrefix += unescape(encodeURIComponent(this.opts.params[paramName])) + "\r\n";
                    }
                }

            if (e.params)
                for (var paramName in e.params) {
                    if (e.params.hasOwnProperty(paramName)) {
                        contentPrefix += "--" + boundary + '\r\n';
                        contentPrefix += 'Content-Disposition: form-data; name="' + paramName + '"\r\n\r\n';
                        contentPrefix += unescape(encodeURIComponent(e.params[paramName])) + "\r\n";
                    }
                }

            var filename = unescape(encodeURIComponent(e.name));
            contentPrefix += "--" + boundary + '\r\n';
            contentPrefix += 'Content-Disposition: form-data; name="' + (this.opts.filefiledname || "file") + '"; filename="' + filename + '"\r\n';
            contentPrefix += 'Content-Type: application/octet-stream\r\n\r\n';

            return {
                formdata: contentPrefix,
                boundary: boundary
            };
        } else {
            var formData = new FormData();

            if (this.opts.params)
                for (var paramName in this.opts.params) {
                    if (this.opts.params.hasOwnProperty(paramName)) {
                        formData.append(paramName, this.opts.params[paramName]);
                    }
                }

            if (e.params)
                for (var paramName in e.params) {
                    if (e.params.hasOwnProperty(paramName)) {
                        formData.append(paramName, e.params[paramName]);
                    }
                }

            return formData;
        }
    },
    onUploadPartailFile: function (e, t, i, o) {
        i.start = i.index * this.opts.chunksize;
        var chunkSize = Math.min(this.opts.chunksize, t.size - i.start);

        if ("PROCESSING" === t.status) {
            var fileSlice;

            if (window.File && File.prototype.slice) {
                fileSlice = t.file.slice(i.start, i.start + chunkSize);
            } else if (window.File && File.prototype.webkitSlice) {
                fileSlice = t.file.webkitSlice(i.start, i.start + chunkSize);
            } else if (window.File && File.prototype.mozSlice) {
                fileSlice = t.file.mozSlice(i.start, i.start + chunkSize);
            } else {
                this.onError({}, t);
                return;
            }

            this.sendArray(e, t, fileSlice, i, o);
        }
    },
    createActionsSection: function () {
        return new SYNO.ux.FieldSet({
            title: 'RR Actions',
            items: [
                {
                    xtype: 'syno_panel',
                    // cls: 'panel-with-border',
                    activeTab: 0,
                    plain: true,
                    items: [
                        {
                            xtype: 'syno_compositefield',
                            hideLabel: true,
                            items: [{
                                xtype: 'syno_displayfield',
                                value: 'Run Update: ',
                                width: 140
                            }, {
                                xtype: 'syno_button',
                                btnStyle: 'green',
                                text: this._V('ui', 'upload_file_dialog_title'),
                                handler: this.showUpdateUploadDialog.bind(this)
                            }]
                        },
                    ],
                    deferredRender: true
                },
            ]
        });
    },
    fillConfig: function (e) {
        this.poolLinkId = Ext.id();
        this.iconTpl = this.createIconTpl();
        this.titleTpl = this.createTitleTpl();
        this.upperPanel = this.createUpperPanel();
        this.lowerPanel = this.createLowerPanel();

        this.descMapping = {
            normal: this._V('ui', 'greetings_text'),
            target_abnormal: []
        };

        const t = {
            layout: "hbox",
            cls: "iscsi-overview-health-panel",
            autoHeight: !0,
            items: [
                { xtype: "box", itemId: "icon", cls: "health-icon-block" },
                {
                    xtype: "syno_panel",
                    itemId: "rightPanel",
                    cls: "health-text-block",
                    flex: 1,
                    height: 120,
                    layout: "vbox",
                    layoutConfig: { align: "stretch" },
                    items: [this.upperPanel, this.lowerPanel],
                },
                {
                    xtype: "syno_panel",
                    itemId: "rightPanel2",
                    // cls: "health-text-block",
                    flex: 1,
                    height: 96,
                    layout: "vbox",
                    layoutConfig: { align: "stretch" },
                    items: [this.createActionsSection()],
                },

            ],
            listeners: { scope: this, data_ready: this.onDataReady },
        };
        return Ext.apply(t, e), t;

    }, createIconTpl: function () {
        return new Ext.XTemplate('<div class="health-icon {status}"></div>', {
            compiled: !0,
            disableFormats: !0,
        });
    },
    createTitleTpl: function () {
        return new Ext.XTemplate(
            '<div class="health-text-title {status}">{[this.getStatusText(values.status)]}</div>',
            {
                compiled: !0,
                disableFormats: !0,
                statusText: {
                    normal: "Healthy",
                    warning: "Warning",
                    error: "Error"
                },
                getStatusText: function (e) {
                    return this.statusText[e];
                },
            }
        );
    },
    createUpperPanel: function () {
        return new SYNO.ux.Panel({
            layout: "hbox",
            items: [
                {
                    xtype: "box",
                    itemId: "title",
                    flex: 1,
                    cls: "iscsi-overview-health-title-block",
                },
                {
                    xtype: "syno_button",
                    itemId: "leftBtn",
                    hidden: !0,
                    cls: "iscsi-overview-health-prev-btn",
                    scope: this,
                    handler: this.onLeftBtnClick,
                    text: " ",
                },
                {
                    xtype: "syno_button",
                    itemId: "rightBtn",
                    hidden: !0,
                    cls: "iscsi-overview-health-next-btn",
                    scope: this,
                    handler: this.onRightBtnClick,
                    text: " ",
                },
            ],
        });
    },
    createLowerPanel: function () {
        return new SYNO.ux.Panel({
            flex: 1,
            items: [
                {
                    xtype: "syno_displayfield",
                    itemId: "desc",
                    cls: "health-text-content",
                    htmlEncode: !1,
                },
                {
                    xtype: "syno_displayfield",
                    itemId: "desc2",
                    cls: "health-text-content",
                    htmlEncode: !1,
                    value: "This is value"
                },
            ],
        });
    },
    updateDesc: function (e) {
        const t = this;
        this.descs = [];
        let i,
            s,
            n = -1;
        const
            a = this.descs.length,
            o = this.getComponent("rightPanel"),
            r = this.lowerPanel.getComponent("desc"),
            m = this.lowerPanel.getComponent("desc2"),
            l = this.upperPanel.getComponent("leftBtn"),
            S = this.upperPanel.getComponent("rightBtn"),
            c = r.getHeight();
        let d = o.getHeight(),
            p = !1;
        s = this.descMapping.normal;
        r.setValue(t.owner.systemInfoTxt);
        m.setValue(t.owner.rrManagerVersionText);
        const u = r.getHeight();
        if (
            (u !== c && ((d = d - c + u), (p = !0)),
                p && ((o.height = d), this.doLayout(), this.owner.doLayout()),
                this.descs.length <= 1)
        )
            return l.hide(), void S.hide();
        (l.hidden || S.hidden) && (l.show(), S.show(), this.doLayout());
    },
    prepareSummaryStatus: function (e, t) {
    },
});

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
        const t = { compiled: !0, disableFormats: !0 },
            i = {
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
                            title: "Events",
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
        console.log("--onDataReady3")
        Ext.each(this.statusBoxs, (e) => {
            e.fireEvent("data_ready");
        });
    },
});

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
                ["", "All"],
                ["system", "System"],
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
                    text: "Items per page",
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
        const e = this,
            t = new SYNO.ux.Toolbar();
        return (
            // (e.clearButton = new SYNO.ux.Button({
            //     xtype: "syno_button",
            //     text: "Clear",
            //     handler: e.onLogClear,
            //     scope: e,
            // })),
            (e.saveButton = new SYNO.ux.Button({
                xtype: "syno_button",
                text: "Save",
                handler: e.onAddonsSave,
                btnStyle: "blue",
                scope: e,
            })),
            // (e.searchField = new SYNOCOMMUNITY.RRManager.AdvancedSearchField({
            //     iconStyle: "filter",
            //     owner: e,
            // })),
            // (e.searchField.searchPanel = e.searchPanel),
            // t.add(e.clearButton),
            t.add(e.saveButton),
            t.add("->"),
            t.add(e.initCategoryComboBox(e.getCategoryStore())),
            t.add({ xtype: "tbspacer", width: 4 }),
            // t.add(e.searchField),
            t
        );
        // return [];
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
            listeners: {
                exception: this.loadException,
                beforeload: this.onBeforeStoreLoad,
                load: this.onAfterStoreLoad,
                scope: this,
            }
        });
        return gridStore;
    },
    getColumnModel: function () {
        var currentLngCode = this._getLng(SYNO?.SDS?.Session?.lang || "enu");
        this.Col1 = new SYNO.ux.EnableColumn({
            header: "System",
            dataIndex: "system",
            id: "system",
            name: "system",
            width: 100,
            align: "center",
            enableFastSelectAll: false,
            disabled: true,
            bindRowClick: true
        })
        this.Col2 = new SYNO.ux.EnableColumn({
            header: "Installed",
            dataIndex: "installed",
            name: "installed",
            id: "installed",
            width: 100,
            align: "center",
            enableFastSelectAll: false,
            disabled: true,
            bindRowClick: true
        });

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
                }, this.Col1, this.Col2,
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
                emptyText: "no_log_available",
                templates: {
                    cell: new Ext.XTemplate(
                        '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} x-selectable {css}" style="{style}" tabIndex="-1" {cellAttr}>',
                        '<div class="{this.selectableCls} x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>',
                        "</td>",
                        { selectableCls: SYNO.SDS.Utils.SelectableCLS }
                    ),
                },
            }),
            plugins: [this.Col1, this.Col2],
            selModel: new Ext.grid.RowSelectionModel({
                singleSelect: false
            }),
            loadMask: !0,
            stripeRows: !0,
            listeners: {
                cellclick: {
                    delay: 100,
                    scope: this,
                    fn: this.onCellClick
                },
            }
        };
        return Ext.apply(i, e), i;
    },
    onCellClick: function (grid, recordIndex, i, s) {
        var record = grid.store.data.get(recordIndex);
        var id = grid.getColumnModel().getColumnAt(i).id;
        record.data[id] = !record.data[id];
        grid.getView().refresh();
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
        this.loadData();
    },
    enableButtonCheck: function () {
        // this.logStore.getTotalCount()
        //     ? (this.clearButton.enable())
        //     : (this.clearButton.disable());
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
        // SYNO.SDS.iSCSI.Utils.SetEmptyIcon(this, e);
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
                    "error_system"
                ),
            this.appWin.clearStatusBusy();
    },
    onAddonsSave: function (e) {
        debugger;
    },
    onLogClear: function () {
        // const e = this;
        // e.appWin.getMsgBox().confirmDelete(
        //     e.appWin.title,
        //     "log_cfrm_clear",
        //     (t) => {
        //         "yes" === t &&
        //             (e.appWin.setStatusBusy(),
        //                 e.appWin.sendWebAPI({
        //                     api: "SYNO.Core.ISCSI.Node",
        //                     version: 1,
        //                     method: "log_clear",
        //                     callback: e.onClearLogDone,
        //                     scope: e,
        //                 }));
        //     },
        //     e,
        //     {
        //         yes: {
        //             text: "Clear",
        //             btnStyle: "red",
        //         },
        //         no: { text: Ext.MessageBox.buttonText.no },
        //     }
        // );
    },
    onExportCSV: function () {
        this.onLogSave("csv");
    },
    onExportHtml: function () {
        this.onLogSave("html");
    },
    onLogSave: function (e) {
        // _S("demo_mode")
        //     ? this.appWin
        //         .getMsgBox()
        //         .alert(this.appWin.title, _JSLIBSTR("uicommon", "error_demo"))
        //     : this.saveLog(e);
    },
    saveLog: function (e) {
        // const t = this,
        //     i = t.logStore,
        //     s = { export_format: e };
        // Ext.apply(s, i.baseParams),
        //     t.downloadWebAPI({
        //         webapi: {
        //             version: 1,
        //             api: "SYNO.Core.ISCSI.Node",
        //             method: "log_export",
        //             params: s,
        //         },
        //         scope: t,
        //     });
    },
    destroy: function () {
        this.rowNav && (Ext.destroy(this.rowNav), (this.rowNav = null)),
            this.searchField && this.searchField.fireEvent("destroy"),
            this.callParent([this]);
    },
});

Ext.define("SYNOCOMMUNITY.RRManager.AdvancedSearchField", {

    extend: "SYNO.ux.SearchField",
    initEvents: function () {
        this.callParent(arguments),
            this.mon(Ext.getDoc(), "mousedown", this.onMouseDown, this),
            this.mon(this, "keypress", (function (e, t) {
                t.getKey() === Ext.EventObject.ENTER && (this.searchPanel.setKeyWord(this.getValue()),
                    this.searchPanel.onSearch())
            }
            ), this),
            this.mon(this, "destroy", (function () {
                this.searchPanel.destroy()
            }
            ), this)
    },
    isInnerComponent: function (e, t) {
        let i = !1;
        return e.getTarget(".syno-datetimepicker-inner-menu") && (i = !0),
            t.items.each((function (t) {
                if (t instanceof Ext.form.ComboBox) {
                    if (t.view && e.within(t.view.getEl()))
                        return i = !0,
                            !1
                } else if (t instanceof Ext.form.DateField) {
                    if (t.menu && e.within(t.menu.getEl()))
                        return i = !0,
                            !1
                } else if (t instanceof Ext.form.CompositeField && this.isInnerComponent(e, t))
                    return i = !0,
                        !1
            }
            ), this),
            i
    },
    onMouseDown: function (e) {
        const t = this.searchPanel;
        !t || !t.isVisible() || t.inEl || e.within(t.getEl()) || e.within(this.searchtrigger) || this.isInnerComponent(e, this.searchPanel.getForm()) || t.hide()
    },
    onSearchTriggerClick: function () {
        this.searchPanel.isVisible() ? this.searchPanel.hide() : (this.searchPanel.getEl().alignTo(this.wrap, "tr-br?", [6, 0]),
            this.searchPanel.show(),
            this.searchPanel.setKeyWord(this.getValue()))
    },
    onTriggerClick: function () {
        this.callParent(),
            this.searchPanel.onReset()
    }
});

//Settings tab
Ext.define("SYNOCOMMUNITY.RRManager.Setting.Main", {
    extend: "SYNO.SDS.Utils.TabPanel",
    API: {},// SYNO.SDS.iSCSI.Utils.API,
    constructor: function (e) {
        (this.appWin = e.appWin),
            (this.owner = e.owner),
            this.callParent([this.fillConfig(e)]);
    },
    fillConfig: function (e) {
        (this.generalTab = new SYNOCOMMUNITY.RRManager.Setting.GeneralTab({
            appWin: this.appWin,
            owner: this,
            itemId: "GeneralTab",
        })),
            (this.iscsiTab = new SYNOCOMMUNITY.RRManager.Setting.RRConfigTab({
                appWin: this.appWin,
                owner: this,
                itemId: "RRConfigTab",
            })),
            (this.synoInfoTab = new SYNOCOMMUNITY.RRManager.Setting.SynoInfoTab({
                appWin: this.appWin,
                owner: this,
                itemId: "SynoInfoTab",
            }))
            ;
        const t = [];
        t.push(this.generalTab);
        t.push(this.iscsiTab);
        t.push(this.synoInfoTab);
        const i = {
            title: "Settings",
            autoScroll: !0,
            useDefaultBtn: !0,
            labelWidth: 200,
            fieldWidth: 240,
            activeTab: 0,
            deferredRender: !1,
            items: t,
            listeners: { activate: this.updateAllForm, scope: this },
        };
        return Ext.apply(i, e), i;
    },
    loadAllForms: function (e) {
        console.log(e);
        this.items.each((t) => {
            if(Ext.isFunction(t.loadForm)){
                if(t.itemId== "SynoInfoTab"){
                    t.loadForm(e.synoinfo);
                }else{
                    t.loadForm(e);
                }
                console.log(t);
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
            await this.setConf(), await this.updateAllForm(), this.runTask('ApplyRRConfig');
        } catch (e) {
            throw (
                (SYNO.Debug(e),
                    this.clearStatusBusy(),
                    this.appWin.getMsgBox().alert(this.title, this.API.getErrorString(e)),
                    e)
            );
        }
        this.clearStatusBusy(), this.setStatusOK();
    },
    getParams: function () {
        // const e = {};
        //if (this.generalTab.isFormDirty()) {
            //TODO:
            const t = this.generalTab.getForm().getValues();
            const t2 = this.iscsiTab.getForm().getValues();
        //}
        
        const t3 = this.synoInfoTab.getForm().getValues()?.each();
        const t4 ={};
        t3.forEach(x=>{
            t4["syno_"+x] = t3[x];
        });
         Object.assign({},t,t2,t4);
         return e;
    },
    getConf: function () {
        var rrConfigJson = localStorage.getItem("rrConfig");
        var rrConfig = JSON.parse(rrConfigJson);
        return rrConfig?.user_config;
    },
    _prefix: '/webman/3rdparty/rr-manager/',
    handleFileUpload: function (jsonData) {
        let url = `${this._prefix}uploadConfigFile.cgi`;
        return new Promise((resolve, reject) => {
            Ext.Ajax.request({
                url: url,
                method: 'POST',
                jsonData: jsonData,
                headers: {
                    'Content-Type': 'application/json'
                },
                success: function (response) {
                    resolve(Ext.decode(response.responseText));
                },
                failure: function (response) {
                    reject('Failed with status: ' + response.status);
                }
            });
        });
    },
    runTask: function (taskName) {
        that = this;
        return new Promise((resolve, reject) => {
            let params = {
                task_name: taskName
            };
            let args = {
                api: 'SYNO.Core.EventScheduler',
                method: 'run',
                version: 1,
                params: params,
                stop_when_error: false,
                mode: 'sequential',
                callback: function (success, message) {
                    success ? resolve(message) : reject('Unable to get packages!');
                }
            };
            that.sendWebAPI(args);
        });
    },
    setConf: function () {
        data = this.getParams();
        return this.handleFileUpload(data);
    },
    confirmApply: function () {
        if (!this.isAnyFormDirty())
            return (
                this.setStatusError({
                    text: "Nothing to save",
                    clear: !0,
                }),
                !1
            );
        const e = this.getAllForms().find((e) => !e.isValid());
        return (
            !e ||
            (this.setActiveTab(e.itemId),
                this.setStatusError({
                    text: "forminvalid"
                }),
                !1)
        );
    },
    onPageConfirmLostChangeSave: function () {
        return this.confirmApply() ? this.doApply() : Promise.reject();
    },
});

Ext.define("SYNOCOMMUNITY.RRManager.Setting.GeneralTab", {
    extend: "SYNO.SDS.Utils.FormPanel",
    constructor: function (e) {
        this.callParent([this.fillConfig(e)])
    },
    fillConfig: function (e) {
        this.suspendLcwPrompt = !1;
        const t = {
            title: "General",
            items: [{
                xtype: "syno_fieldset",
                title: "Device Info",
                itemId: "lcw",
                name: "lcw",
                id: "lcw",
                items: [
                    {
                        fieldLabel: 'model',
                        name: 'model',
                        allowBlank: false,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'productver',
                        name: 'productver',
                        allowBlank: false,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'buildnum',
                        name: 'buildnum',
                        allowBlank: false,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'sn',
                        name: 'sn',
                        allowBlank: false,
                        xtype: 'syno_textfield',
                    },
                ]
            },
            new SYNO.ux.FieldSet({
                title: 'Network Info',
                collapsible: true,
                columns: 2,
                items: [
                    {
                        fieldLabel: 'mac1',
                        name: 'mac1',
                        allowBlank: false,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'mac2',
                        name: 'mac2',
                        allowBlank: true,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'mac3',
                        name: 'mac3',
                        allowBlank: true,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'mac4',
                        name: 'mac4',
                        allowBlank: true,
                        xtype: 'syno_textfield',
                    }
                ],
            }),
            new SYNO.ux.FieldSet({
                title: 'Boot Config',
                collapsible: true,
                items: [{
                    fieldLabel: 'vid',
                    name: 'vid',
                    allowBlank: false,
                    xtype: 'syno_textfield',
                }, {
                    fieldLabel: 'pid',
                    name: 'pid',
                    allowBlank: false,
                    xtype: 'syno_textfield',
                }, {
                    boxLabel: 'emmcboot',
                    name: 'emmcboot',
                    xtype: 'syno_checkbox',

                },
                ]
            })
            ]
        };
        return Ext.apply(t, e),
            t
    },
    initEvents: function () {
        this.mon(this, "activate", this.onActivate, this)
    },
    onActivate: function () {
    },
    loadForm: function (e) {
        // const t = Ext.getCmp(this.lcw_enabled);
        // this.appWin.setTpHardThreshold(e.tp_hard_threshold_bytes),
        //     e.lcw_enabled = this.appWin.isLowCapacityWriteEnable(),
        //     t.suspendEvents(),
        this.getForm().setValues(e);
        // t.resumeEvents()
    },
    promptLcwDialog: function (e, t) {
        t && !this.suspendLcwPrompt && this.appWin.getMsgBox().show({
            title: this.title,
            msg: "ddd",
            buttons: {
                yes: {
                    text: Ext.MessageBox.buttonText.yes,
                    btnStyle: "red"
                },
                no: {
                    text: Ext.MessageBox.buttonText.no
                }
            },
            fn: function (e) {
                "yes" !== e && this.form.findField("lcw_enabled").setValue(!1)
            },
            scope: this,
            icon: Ext.MessageBox.ERRORRED,
            minWidth: Ext.MessageBox.minWidth
        })
    }
});

Ext.define("SYNOCOMMUNITY.RRManager.Setting.RRConfigTab", {
    extend: "SYNO.SDS.Utils.FormPanel",
    constructor: function (e) {
        this.callParent([this.fillConfig(e)])
    },
    fillConfig: function (e) {
        this.suspendLcwPrompt = !1;
        const t = {
            title: "RR Config",
            items: [
                new SYNO.ux.FieldSet({
                    title: 'RR Config',
                    collapsible: true,
                    items: [
                        {
                            fieldLabel: 'lkm',
                            name: 'lkm',
                            allowBlank: false,
                            xtype: 'syno_textfield',
                        }, {
                            fieldLabel: 'kernel',
                            name: 'kernel',
                            allowBlank: false,
                            xtype: 'syno_textfield',
                        }, {
                            boxLabel: 'dsmlogo',
                            name: 'dsmlogo',
                            xtype: 'syno_checkbox',

                        }, {
                            boxLabel: 'directboot',
                            name: 'directboot',
                            xtype: 'syno_checkbox',
                        }, {
                            boxLabel: 'prerelease',
                            name: 'prerelease',
                            xtype: 'syno_checkbox',
                            formBind: true,
                            value: false,

                        }, {
                            fieldLabel: 'bootwait',
                            name: 'bootwait',
                            xtype: 'syno_numberfield',
                        }, {
                            fieldLabel: 'bootipwait',
                            name: 'bootipwait',
                            xtype: 'syno_numberfield',
                        }, {
                            fieldLabel: 'kernelway',
                            name: 'kernelway',
                            allowBlank: false,
                            xtype: 'syno_textfield',
                        }, {
                            fieldLabel: 'kernelpanic',
                            name: 'kernelpanic',
                            allowBlank: false,
                            xtype: 'syno_numberfield',
                        }, {
                            boxLabel: 'odp',
                            name: 'odp',
                            xtype: 'syno_checkbox',

                        }, {
                            boxLabel: 'hddsort',
                            name: 'hddsort',
                            xtype: 'syno_checkbox',

                        }, {
                            fieldLabel: 'smallnum',
                            name: 'smallnum',
                            allowBlank: false,
                            xtype: 'syno_numberfield',
                        }
                    ]
                })
            ]
        };
        return Ext.apply(t, e),
            t
    },
    initEvents: function () {
        this.mon(this, "activate", this.onActivate, this)
    },
    onActivate: function () {
    },
    loadForm: function (e) {
        // const t = Ext.getCmp(this.lcw_enabled);
        // this.appWin.setTpHardThreshold(e.tp_hard_threshold_bytes),
        //     e.lcw_enabled = this.appWin.isLowCapacityWriteEnable(),
        //     t.suspendEvents(),
        this.getForm().setValues(e);
        // t.resumeEvents()
    },
    promptLcwDialog: function (e, t) {
        t && !this.suspendLcwPrompt && this.appWin.getMsgBox().show({
            title: this.title,
            msg: "ddd",
            buttons: {
                yes: {
                    text: Ext.MessageBox.buttonText.yes,
                    btnStyle: "red"
                },
                no: {
                    text: Ext.MessageBox.buttonText.no
                }
            },
            fn: function (e) {
                "yes" !== e && this.form.findField("lcw_enabled").setValue(!1)
            },
            scope: this,
            icon: Ext.MessageBox.ERRORRED,
            minWidth: Ext.MessageBox.minWidth
        })
    }
});

Ext.define("SYNOCOMMUNITY.RRManager.Setting.SynoInfoTab", {
    extend: "SYNO.SDS.Utils.FormPanel",
    constructor: function (e) {
        this.callParent([this.fillConfig(e)])
    },
    fillConfig: function (e) {
        this.suspendLcwPrompt = !1;
        const t = {
            title: "Syno Info",
            items: [
                new SYNO.ux.FieldSet({
                    title: 'SynoInfo Config',
                    collapsible: true,
                    name: 'synoinfo',
                    items: [
                        {
                            boxLabel: 'Support Disk compatibility',
                            name: 'support_disk_compatibility',
                            xtype: 'syno_checkbox',

                        }, {
                            boxLabel: 'Support Memory compatibility',
                            name: 'support_memory_compatibility',
                            xtype: 'syno_checkbox',

                        }, {
                            boxLabel: 'Support Led brightness adjustment',
                            name: 'support_led_brightness_adjustment',
                            xtype: 'syno_checkbox',

                        }, {
                            boxLabel: 'Support leds lp3943',
                            name: 'support_leds_lp3943',
                            xtype: 'syno_checkbox',

                        }, {
                            boxLabel: 'Support syno hybrid RAID',
                            name: 'support_syno_hybrid_raid',
                            xtype: 'syno_checkbox',

                        }, {
                            boxLabel: 'Support RAID group',
                            name: 'supportraidgroup',
                            xtype: 'syno_checkbox',

                        }, {
                            fieldLabel: 'Max LAN port',
                            name: 'maxlanport',
                            allowBlank: false,
                            xtype: 'syno_numberfield',
                        }, {
                            fieldLabel: 'Netif seq',
                            name: 'netif_seq',
                            allowBlank: false,
                            xtype: 'syno_textfield',
                        }, {
                            fieldLabel: 'Buzzer offen',
                            name: 'buzzeroffen',
                            allowBlank: false,
                            xtype: 'syno_textfield',
                        }
                    ]
                })
            ]
        };
        return Ext.apply(t, e),
            t
    },
    initEvents: function () {
        this.mon(this, "activate", this.onActivate, this)
    },
    onActivate: function () {
    },
    loadForm: function (e) {
        this.getForm().setValues(e);
    },
    promptLcwDialog: function (e, t) {
        t && !this.suspendLcwPrompt && this.appWin.getMsgBox().show({
            title: this.title,
            msg: "ddd",
            buttons: {
                yes: {
                    text: Ext.MessageBox.buttonText.yes,
                    btnStyle: "red"
                },
                no: {
                    text: Ext.MessageBox.buttonText.no
                }
            },
            fn: function (e) {
                "yes" !== e && this.form.findField("lcw_enabled").setValue(!1)
            },
            scope: this,
            icon: Ext.MessageBox.ERRORRED,
            minWidth: Ext.MessageBox.minWidth
        })
    }
});