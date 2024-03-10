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

// Translator
_V = function (category, element) {
    return _TT("SYNOCOMMUNITY.RRManager.AppInstance", category, element)
}

formatString = function (str, ...args) {
    return str.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
}

// Window definition
Ext.define('SYNOCOMMUNITY.RRManager.AppWindow', {
    extend: 'SYNO.SDS.AppWindow',
    appInstance: null,
    tabs: null,
    constructor: function (config) {
        this.appInstance = config.appInstance;
        Ext.util.CSS.createStyleSheet('.my-icon { background-image: url("webman/3rdparty/StorageManager/images/default/1x/overview_status.png") !important; }');
        Ext.util.CSS.createStyleSheet('.lb-title { font-weight: bold; }');
        Ext.util.CSS.createStyleSheet('.tab { background-color: #f4f8fa; }');
        Ext.util.CSS.createStyleSheet('.mainWindow { background-color: white }');
        Ext.util.CSS.createStyleSheet('.panel-with-border { padding: 10px; margin: 10px; border-radius: 2px; box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5); }');
        this.tabs = (function () {
            var allTabs = [];

            // Tab for CGI or API calls
            allTabs.push({
                title: _V("ui", "tab_general"),
                id: "tabGeneral",
                cls: 'tab',
                height: '100%',
                items: [
                    //this.createSystemInfoPannel(),
                    this.createGeneralSection(),
                    this.createActionsSection(),
                    // this.createDisplayExternalAPI()
                ]
            });

            allTabs.push({
                title: _V("ui", "tab_addons"),
                layout: 'fit',
                id: "tabAddons",
                cls: 'tab',
                items: [
                    // this.createSynoStore(),
                    this.createAddonsStore()
                ]
            });

            return allTabs;
        }).call(this);


        config = Ext.apply({
            resizable: true,
            maximizable: true,
            minimizable: true,
            width: 640,
            height: 640,
            cls: 'mainWindow',
            items: [
                {
                    xtype: 'syno_tabpanel',
                    name: 'tabsControl',
                    id: 'tabsControl',
                    activeTab: 0,
                    plain: true,
                    items: this.tabs,
                    deferredRender: true
                }
            ]
        }, config);

        this.callParent([config]);
    },
    saveChanges: function (e) {
        //Rewrite rr config with new addons
        var newAddons = {};
        this['rrInstalledAddons']?.forEach(addonName => {
            newAddons[addonName] = ''
        });

        this['rrConfigNew'] = this['rrConfig']['user_config'];
        this['rrConfigNew']['addons'] = newAddons;
        this.handleFileUpload(this['rrConfigNew']);
    },
    handleFileUpload: function (jsonData) {
        let url = `${this.API._prefix}uploadConfigFile.cgi`;
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
    createUploadPannel: function () {
        var myFormPanel = new Ext.form.FormPanel({
            title: _V("ui", "lb_select_update_file"),
            fileUpload: true,
            name: 'upload_form',
            border: !1,
            bodyPadding: 10,
            items: [{
                xtype: 'syno_filebutton',
                text: _V('ui', 'select_file'),
                name: 'filename',
                allowBlank: false,
            }],
        });
        this["upload_form"] = myFormPanel;
        return myFormPanel;
    },
    createSystemInfoPannel: function () {

        return new SYNO.ux.FieldSet({
            collapsible: true,
            title: 'Device Information',
            id: 'deviceInfoPanel',
            name: 'deviceInfoPanel',
            frame: true,
            labelWidth: 130,
            autoScroll: true,
            items: []
        });
    },
    // Create the display of CGI calls
    createGeneralSection: function () {
        return new SYNO.ux.FieldSet({
            items: [
                {
                    xtype: 'syno_panel',
                    cls: 'panel-with-border',
                    activeTab: 0,
                    plain: true,
                    items: [
                        {
                            xtype: 'syno_compositefield',
                            hideLabel: true,
                            items: [
                                {
                                    xtype: 'syno_displayfield',
                                    cls: 'my-icon',
                                    width: 48,
                                    height: 48
                                },
                                {
                                    xtype: 'syno_displayfield',
                                    cls: 'lb-title',
                                    value: _V('ui', 'greetings_text'),
                                    width: 200,
                                }]
                        }, {
                            xtype: 'syno_compositefield',
                            hideLabel: true,
                            items: [
                                {
                                    xtype: 'syno_displayfield',
                                    value: '💊RR v.',
                                    cls: 'lb-title',
                                    width: 60,
                                }, {
                                    xtype: 'syno_displayfield',
                                    width: 55,
                                    id: 'lbRrVersion',
                                    title: '...'
                                }, {
                                    xtype: 'syno_displayfield',
                                    width: 120,
                                    cls: 'lb-title',
                                    value: _V('ui', 'system_info')
                                }, {
                                    xtype: 'syno_displayfield',
                                    width: 500,
                                    id: 'lbSystemInfo',
                                    value: _V('ui', 'loading_text')
                                }
                            ]
                        },
                        {
                            xtype: 'syno_compositefield',
                            hideLabel: true,
                            items: [
                                {
                                    xtype: 'syno_displayfield',
                                    width: 140,
                                    cls: 'lb-title',
                                    value: '🛡️RR Manager v.:'
                                },
                                {
                                    xtype: 'syno_displayfield',
                                    width: 55,
                                    id: 'lbRrManagerVersion',
                                    value: '...'
                                },
                            ]
                        }
                    ],
                    deferredRender: true
                },
            ]
        });
    },
    // Create the display of API calls
    createActionsSection: function () {
        return new SYNO.ux.FieldSet({
            title: _V('ui', 'rr_actions'),
            cls: 'panel-with-border',
            collapsible: false,
            items:
                [
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
                            text: _V('ui', 'upload_file_dialog_title'),
                            handler: this.showUpdateUploadDialog.bind(this)
                        }]
                    },
                    {
                        xtype: 'syno_compositefield',
                        hideLabel: true,
                        items: [{
                            xtype: 'syno_displayfield',
                            value: 'Clean up system partition:',
                            width: 140
                        }, {
                            xtype: 'syno_button',
                            btnStyle: 'red',
                            text: 'Run Clean Up',
                            handler: this.onRunCleanUpSystemPartition.bind(this)
                        }]
                    },
                    {
                        xtype: 'syno_compositefield',
                        hideLabel: true,
                        items: [{
                            xtype: 'syno_displayfield',
                            value: '(TEST)Create SQL test',
                            width: 140
                        }, {
                            xtype: 'syno_button',
                            btnStyle: 'red',
                            text: 'Run Create SQL',
                            handler: this.onRunCreateSQL.bind(this)
                        }]
                    }
                ]
        });
    },
    API: {
        _baseUrl: 'webapi/entry.cgi?',
        _prefix: '/webman/3rdparty/rr-manager/',
        runTask: function (taskName, callback) {
            let compound = JSON.stringify([{ 'api': 'SYNO.Core.EventScheduler', 'method': 'run', 'version': 1, 'task_name': taskName }]);
            var t = `${this._baseUrl}api=SYNO.Entry.Request&method=request&version=1&stop_when_error=false&mode='sequential'&compound=${compound}`;
            Ext.Ajax.request({
                url: t,
                method: 'GET',
                timeout: 60000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: function (response) {
                    if (callback) callback(response.responseText);
                },
                failure: function (response) {
                    that.showMsg('Error', 'Request Failed');
                    console.error(response);
                }
            });
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
                        if (typeof response?.responseText === 'string') {
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
        getSharesList: function () {
            return new Promise((resolve, reject) => {
                Ext.Ajax.request({
                    url: this._baseUrl,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Accept': '*/*'
                    },
                    params: {
                        api: 'SYNO.FileStation.List',
                        method: 'list_share',
                        version: 2,
                        filetype: 'dir', // URL-encode special characters if needed
                        sort_by: 'name',
                        check_dir: true,
                        additional: '["real_path","owner","time","perm","mount_point_type","sync_share","volume_status","indexed","hybrid_share","worm_share"]',
                        enum_cluster: true,
                        node: 'fm_root'
                    },
                    success: function (response) {
                        if (typeof response?.responseText === 'string') {
                            resolve(Ext.decode(response?.responseText));
                        } else {
                            resolve(response?.responseText);
                        }
                    },
                    failure: function (response) {
                        if (typeof result?.responseText === 'string' && result?.responseText) {
                            var response = Ext.decode(result?.responseText);
                            reject(response?.error);
                        }
                        else {
                            reject('Failed with status: ' + response.status);
                        }
                    }
                });
            });
        },
        getSytemInfo: function () {
            return new Promise((resolve, reject) => {
                Ext.Ajax.request({
                    url: this._baseUrl,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Accept': '*/*'
                    },
                    params: {
                        api: 'SYNO.DSM.Info',
                        method: 'getinfo',
                        version: 2
                    },
                    success: function (response) {
                        if (typeof response?.responseText === 'string') {
                            resolve(Ext.decode(response?.responseText));
                        } else {
                            resolve(response?.responseText);
                        }
                    },
                    failure: function (response) {
                        if (typeof result?.responseText === 'string' && result?.responseText) {
                            var response = Ext.decode(result?.responseText);
                            reject(response?.error);
                        }
                        else {
                            reject('Failed with status: ' + response.status);
                        }
                    }
                });
            });
        },
        getPackagesList: function () {
            return new Promise((resolve, reject) => {
                Ext.Ajax.request({
                    url: this._baseUrl,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Accept': '*/*'
                    },
                    params: {
                        api: 'SYNO.Core.Package',
                        method: 'list',
                        version: 2,
                        additional: ["description", "description_enu", "dependent_packages", "beta", "distributor", "distributor_url", "maintainer", "maintainer_url", "dsm_apps", "dsm_app_page", "dsm_app_launch_name", "report_beta_url", "support_center", "startable", "installed_info", "support_url", "is_uninstall_pages", "install_type", "autoupdate", "silent_upgrade", "installing_progress", "ctl_uninstall", "updated_at", "status", "url", "available_operation", "install_type"],
                        ignore_hidden: false,
                    },
                    success: function (response) {
                        if (typeof response?.responseText === 'string') {
                            resolve(Ext.decode(response?.responseText));
                        } else {
                            resolve(response?.responseText);
                        }
                    },
                    failure: function (response) {
                        if (typeof result?.responseText === 'string' && result?.responseText) {
                            var response = Ext.decode(result?.responseText);
                            reject(response?.error);
                        }
                        else {
                            reject('Failed with status: ' + response.status);
                        }
                    }
                });
            });
        },
        getTaskList: function () {
            return new Promise((resolve, reject) => {
                Ext.Ajax.request({
                    url: this._baseUrl,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Accept': '*/*'
                    },
                    params: {
                        api: 'SYNO.Core.TaskScheduler',
                        method: 'list',
                        version: 3,
                        sort_by: "next_trigger_time",
                        sort_direction: "ASC",
                        offset: 0,
                        limit: 50
                    },
                    success: function (response) {
                        if (typeof response?.responseText === 'string') {
                            resolve(Ext.decode(response?.responseText));
                        } else {
                            resolve(response?.responseText);
                        }
                    },
                    failure: function (response) {
                        if (typeof result?.responseText === 'string' && result?.responseText) {
                            var response = Ext.decode(result?.responseText);
                            reject(response?.error);
                        }
                        else {
                            reject('Failed with status: ' + response.status);
                        }
                    }
                });
            });
        },
        rebootSystem: function () {
            return new Promise((resolve, reject) => {
                Ext.Ajax.request({
                    url: this._baseUrl,
                    method: 'POST',
                    jsonData: {
                        api: SYNO.Core.System,
                        method: reboot,
                        version: 2,
                        force: false,
                        local: true,
                        firmware_upgrade: false,
                        cache_check_shutdown: false
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Accept': '*/*'
                    },
                    success: function (response) {
                        if (typeof response?.responseText === 'string') {
                            resolve(Ext.decode(response?.responseText));
                        } else {
                            resolve(response?.responseText);
                        }
                    },
                    failure: function (response) {
                        if (typeof result?.responseText === 'string' && result?.responseText) {
                            var response = Ext.decode(result?.responseText);
                            reject(response?.error);
                        }
                        else {
                            reject('Failed with status: ' + response.status);
                        }
                    }
                });
            });

        },
        createRunRrUpdateTask: function (token, callback) {
            params = {
                task_name: "RunRrUpdate",
                owner: { 0: "root" },
                event: "bootup",
                enable: false,
                depend_on_task: "",
                notify_enable: false,
                notify_mail: "",
                notify_if_error: false,
                operation_type: "script",
                operation:
                    ". /var/packages/rr-manager/target/app/config.txt\n/usr/bin/rr-update.sh updateRR \"$UPLOAD_DIR_PATH$RR_TMP_DIR\"/update.zip /tmp/rr_update_progress",
            };

            if (token != "") {
                params.SynoConfirmPWToken = token
            }

            args = {
                method: "create",
                version: 1,
                params: params,
                callback: function (success, message) {
                    if (!success) {
                        console.log("error create EventScheduler task");
                        return;
                    }
                },
                scope: this,
            }

            if (token != "") {
                args.api = "SYNO.Core.EventScheduler.Root"
            } else {
                args.api = "SYNO.Core.EventScheduler"
            }

            this.sendWebAPI(args);
        },
        createRunSetPriviledgeForRRTask: function (token) {
            params = {
                task_name: "SetRootPrivsToRrManager",
                owner: { 0: "root" },
                event: "bootup",
                enable: false,
                depend_on_task: "",
                notify_enable: false,
                notify_mail: "",
                notify_if_error: false,
                operation_type: "script",
                operation:
                    "sed -i 's/package/root/g' /var/packages/rr-manager/conf/privilege && synopkg restart rr-manager",
            };

            if (token != "") {
                params.SynoConfirmPWToken = token
            }

            args = {
                method: "create",
                version: 1,
                params: params,
                callback: function (success, message) {
                    if (!success) {
                        console.log("error create EventScheduler task");
                        return;
                    }

                    if (token != "") {
                        this.API.sendRunSchedulerTaskWebAPI.bind(this, { token });
                    }
                },
                scope: this,
            }

            if (token != "") {
                args.api = "SYNO.Core.EventScheduler.Root"
            } else {
                args.api = "SYNO.Core.EventScheduler"
            }

            this.sendWebAPI(args);
        },
        sendRunSchedulerTaskWebAPI: function (token) {
            args = {
                api: "SYNO.Core.EventScheduler",
                method: "run",
                version: 1,
                params: {
                    task_name: "SetRootPrivsToRrManager",
                },
                callback: function (success, message, data) {
                    if (!success) {
                        console.log("error run EventScheduler task");
                        return;
                    }
                },
                scope: this,
            };

            if (token != "") {
                params.SynoConfirmPWToken = token
            }
            this.sendWebAPI(args);
        },
        createAndRunSchedulerTask: function (data) {
            this.fetchSynoConfirmPWToken(data,
                this.API.createRunRrUpdateTask.bind(this)
            );
        },
        createAndRunSchedulerTaskSetRootPrivilegesForRrManager: function (data) {
            this.fetchSynoConfirmPWToken(data,
                this.API.createRunSetPriviledgeForRRTask.bind(this)
            );
        },
    },
    onRunCreateSQL: function () {
        var that = this;
        this.API.callCustomScript("createsqlitedata.cgi")
            .then((x) => that.showMsg("Done", `The script has been createsqlitedata runned.`))
            .catch((e) => that.showMsg("Error", `Unable to run createsqlitedata script. ${e}`));
    },
    onRunCleanUpSystemPartition: function () {
        var that = this;
        this.showPrompt(_V("ui", "confirm_system_clean_up_msg"), _V("ui", "confirm_system_clean_up_title"), x => {
            this.API.callCustomScript("../../clean_system_disk.cgi")
                .then((x) => that.showMsg("Done", `The script has been successfully runned.`))
                .catch((e) => that.showMsg("Error", `Unable to run cleanup script. ${e}`));
        });
    },
    onRunTaskMountLoaderDiskClick: function () {
        this.API.runTask('MountLoaderDisk');
    },
    onRunTaskUnMountLoaderDiskClick: function () {
        this.API.runTask('UnMountLoaderDisk');
    },
    showMsg(title, msg) {
        return new SYNO.SDS.MessageBoxV5()
            .alert(title, msg);
    },
    showPrompt: function (text, title, yesCallback) {
        var window = new SYNO.SDS.ModalWindow({
            closeAction: "hide",
            layout: "fit",
            width: 400,
            height: 200,
            resizable: !1,
            title: title,
            buttons: [{
                text: _T("common", "alt_cancel"),
                // Handle Cancel
                handler: function () {
                    window.close();
                }
            }, {
                text: _V("ui", "alt_confirm"),
                itemId: "confirm",
                btnStyle: "blue",
                // Handle Confirm
                handler: function () {
                    if (yesCallback) yesCallback();
                    window.close();
                }
            }],
            items: [{
                xtype: 'syno_displayfield',
                value: text,
            }
            ],
        });
        window.open();
    },
    updateFileRealPath: function () {
        return `${this?.rrManagerConfig?.UPLOAD_DIR_PATH}/${this?.rrManagerConfig?.RR_TMP_DIR}/${this.opts.params.filename}`;
    },
    onRunRrUpdateManuallyClick: function () {
        that = this;
        this.API.getUpdateFileInfo(that.updateFileRealPath()).then((responseText) => {
            if (!responseText.success) {
                that.showMsg('title', formatString(_V('ui', 'unable_update_rr_msg'), responseText?.error));
                return;
            }

            var configName = 'rrUpdateFileVersion';
            that[configName] = responseText;
            let currentRrVersion = that["rrConfig"]?.rr_version;
            let updateRrVersion = that[configName].updateVersion;

            async function runUpdate() {
                //show the spinner
                that.getEl().mask(_T("common", "loading"), "x-mask-loading");
                that.API.runTask('RunRrUpdate');
                var maxCountOfRefreshUpdateStatus = 250;
                var countUpdatesStatusAttemp = 0;

                var updateStatusInterval = setInterval(async function () {
                    var checksStatusResponse = await that.API.callCustomScript('checkUpdateStatus.cgi?filename=rr_update_progress');
                    var response = checksStatusResponse.result;
                    that.getEl().mask(formatString(_V('ui', 'update_rr_progress_msg'), response?.progress, response?.progressmsg), 'x-mask-loading');
                    countUpdatesStatusAttemp++;
                    if (countUpdatesStatusAttemp == maxCountOfRefreshUpdateStatus || response?.progress?.startsWith('-')) {
                        clearInterval(updateStatusInterval);
                        that?.getEl()?.unmask();
                        that.showMsg('title', formatString(_V('ui'), response?.progress, response?.progressmsg));
                    } else if (response?.progress == '100') {
                        that?.getEl()?.unmask();
                        clearInterval(updateStatusInterval);
                        that.showMsg('title', _V('ui', 'update_rr_completed'));
                    }
                }, 1500);
            }
            that.showPrompt(formatString(_V('ui', 'update_rr_confirmation'), currentRrVersion, updateRrVersion),
                _V('ui','update_rr_confirmation_title'), runUpdate);
        }).catch(error => {
            that.showMsg('title', `Error. ${error}`);
        });
    },
    populateSystemInfoPanel: function (config) {
        Ext.getCmp('lbRrVersion').setValue(config.rr_version);
        var userConfig = config.user_config;
        if (!userConfig) return;


        var panel = Ext.getCmp('deviceInfoPanel');
        // Function to handle adding both simple and complex (nested objects) properties
        var addItems = function (object, prefix) {
            var ignoreKeys = ['addons', 'modules'];
            for (var key in object) {
                if (ignoreKeys.indexOf(key) >= 0) return;

                var value = object[key];
                var fieldLabel = prefix ? prefix + '.' + key : key; // Handle nested keys

                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // If the value is a nested object, recursively add its properties
                    addItems(value, fieldLabel);
                } else {
                    // Convert non-string values to strings for display
                    if (typeof value !== 'string') {
                        value = JSON.stringify(value);
                    }

                    panel.add({ xtype: 'displayfield', fieldLabel: fieldLabel, value: value || 'N/A', anchor: '100%' });
                }
            }
        };

    },
    //
    // Stores
    //

    // Create the display of SQL Store
    createAddonsStore: function () {
        return new SYNO.ux.FieldSet({
            // title: 'Addons',
            collapsible: false,
            autoHeight: true,
            cls: 'panel-with-border',
            items: [{
                xtype: 'syno_compositefield',
                hideLabel: true,
                items: [
                    this.createAddonsGrid()
                ]
            }
            ]
        });
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
    // Create JSON Store grid calling python SQL API  
    createAddonsGrid: function () {
        var that = this;
        var currentLngCode = this._getLng(SYNO?.SDS?.Session?.lang || "enu");

        var gridStore = new SYNO.API.JsonStore({
            autoDestroy: true,
            url: `${this.API._prefix}getAddons.cgi`,
            restful: true,
            root: 'result',
            idProperty: 'name',
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
            }]
        });
        var paging = new SYNO.ux.PagingToolbar({
            store: gridStore,
            displayInfo: true,
            pageSize: 5,
            refreshText: 'Reload'
        });

        var c = {
            store: gridStore,
            id: 'gridAddons',
            tbar: [
                {
                    xtype: 'syno_compositefield',
                    hideLabel: true,
                    items: [
                        {
                            xtype: 'syno_button',
                            btnStyle: 'green',
                            text: _V('ui', 'save_addons_changes'),
                            handler: this.saveChanges.bind(this)
                        },

                    ]
                }
            ],
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    sortable: true,
                    menuDisabled: true,
                    width: 180,
                    height: 20
                },
                columns: [{
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
                }, {
                    header: 'System',
                    width: 30,
                    dataIndex: 'system',
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        return value ? '✔️' : '';
                    }
                }, {
                    header: 'Installed',
                    width: 50,
                    dataIndex: 'installed',
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (!record.data.system)
                            return '<input type="checkbox" class="grid-checkbox-installed" ' +
                                (value ? 'checked="checked"' : '') +
                                ' data-row="' + row + '" data-record-id="' + record.data.name + '"/>';
                    }
                }]
            }),
            viewConfig: {
                forceFit: true,
                onLoad: Ext.emptyFn,
                listeners: {
                    beforerefresh: function (f) {
                        f.scrollTop = f.scroller.dom.scrollTop;
                    },
                    refresh: function (f) {
                        f.scroller.dom.scrollTop = f.scrollTop;
                    }
                }
            },
            columnLines: true,
            frame: false,
            bbar: paging,
            height: 400,
            cls: 'resource-monitor-performance',
            listeners: {
                scope: this,
                render: function (grid) {
                    grid.getStore().load({
                        params: {
                            offset: 0,
                            limit: 5
                        }
                    });
                },
                afterrender: function (grid) {
                    // Directly use the grid's 'el' property to attach the event listener
                    grid.el.on('change', function (e, t) {
                        if (t.className && t.className.indexOf('grid-checkbox-installed') > -1) {
                            var recordId = t.getAttribute('data-record-id');
                            var record = gridStore.getById(recordId);
                            if (record) {
                                record.set('installed', t.checked);
                            }
                        }
                        //collect installed modules
                        that['rrInstalledAddons'] = grid.getStore().getRange().filter(x => { return x.data.installed == true }).map((x) => {
                            return x.id
                        });
                    }, this, { delegate: 'input.grid-checkbox-installed' });
                }
            }
        };
        return new SYNO.ux.GridPanel(c);
    },
    showPasswordConfirmDialog: function (taskName) {
        return new Promise((resolve, reject) => {
            var window = new SYNO.SDS.ModalWindow({
                id: "confirm_password_dialog",
                title: `${_T("common", "enter_password_to_continue")} for task: ${taskName}.`,
                width: 500,
                height: 200,
                resizable: false,
                layout: "fit",
                buttons: [
                    {
                        xtype: "syno_button",
                        text: _T("common", "alt_cancel"),
                        scope: this,
                        handler: function () {
                            Ext.getCmp("confirm_password_dialog").close();
                            reject(new Error("User cancelled password dialog."));
                        },
                    },
                    {
                        xtype: "syno_button",
                        text: _T("common", "submit"),
                        btnStyle: "blue",
                        scope: this,
                        handler: function () {
                            const passwordValue = Ext.getCmp("confirm_password").getValue();
                            Ext.getCmp("confirm_password_dialog").close();
                            resolve(passwordValue);
                        }
                    },
                ],
                items: [
                    {
                        xtype: "syno_formpanel",
                        id: "password_form_panel",
                        bodyStyle: "padding: 0",
                        items: [
                            {
                                xtype: "syno_displayfield",
                                value: String.format(_T("common", "enter_user_password")),
                            },
                            {
                                xtype: "syno_textfield",
                                fieldLabel: _T("common", "password"),
                                textType: "password",
                                id: "confirm_password",
                            },
                        ],
                    },
                ],
            });
            window.open();
        });
    },
    showUpdateUploadDialog: function () {
        that = this;
        var window = new SYNO.SDS.ModalWindow({
            id: "upload_file_dialog",
            title: _V("ui", "upload_file_dialog_title"),
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
                        Ext.getCmp("confirm_password_dialog").close();
                        reject(new Error("User cancelled password dialog."));
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
                            that.showMsg('error', _V('ui', 'upload_update_file_form_validation_invalid_msg'));
                            return;
                        }
                        that.getEl().mask(_T("common", "loading"), "x-mask-loading");
                        that.onUploadFile(fileObject, that);
                        Ext.getCmp("upload_file_dialog").close();
                    }
                },
            ],
            items: [
                this.createUploadPannel()
            ],
        });
        window.open();
    },
    fetchSynoConfirmPWToken: function (data, callback) {
        this.sendWebAPI({
            api: "SYNO.Core.User.PasswordConfirm",
            method: "auth",
            version: 2,
            params: {
                password: data
            },
            callback: function (success, response) {
                if (!success) {
                    window.alert("invalid admin password");
                    return;
                }

                if (
                    response.SynoConfirmPWToken === null ||
                    (typeof response.SynoConfirmPWToken === "string" &&
                        response.SynoConfirmPWToken.trim() === "")
                ) {
                    console.log("empty SynoConfirmPWToken");
                    return;
                }

                callback(response.SynoConfirmPWToken);
            },
            scope: this,
        });
    },
    __checkDownloadFolder: function (callback) {
        var that = this;
        this.API.getSharesList().then(x => {
            var shareName = `/${that['rrManagerConfig']['SHARE_NAME']}`;
            var sharesList = x.data.shares;
            var downloadsShareMetadata = sharesList.find(x => x.path.toLowerCase() == shareName);
            if (!downloadsShareMetadata) {
                var msg = `❗❗❗Attention! The "${that['rrManagerConfig']['SHARE_NAME']}" share not found. Please create the share and restart the app.`;
                var tabs = Ext.getCmp('tabsControl');
                tabs.getEl().mask(msg, "x-mask-loading");
                this.showMsg('error', msg);
                return;
            }
            //TODO: populate from the config.txt
            that.downloadFolderRealPath = downloadsShareMetadata?.additional?.real_path;
            if (callback) callback();
        });
    },
    __checkRequiredTasks: async function () {
        var that = this;
        var requiredTasks = [
            {
                name: "RunRrUpdate",
                createTaskCallback: this.API.createAndRunSchedulerTask.bind(this)
            },
            {
                name: "SetRootPrivsToRrManager",
                createTaskCallback: this.API.createAndRunSchedulerTaskSetRootPrivilegesForRrManager.bind(this)
            }
        ];

        try {
            let response = await that.API.getTaskList();
            var tasks = response.data.tasks;
            var tasksToCreate = requiredTasks.filter(task => !tasks.find(x => x.name === task.name));

            if (tasksToCreate.length > 0) {
                let tasksNames = tasksToCreate.map(task => task.name).join(', ');
                that.showPrompt(formatString(_V('ui', 'required_tasks_is_missing'), tasksNames), "Required components missing",
                    async function (a) {
                        for (let task of tasksToCreate) {
                            if (task.createTaskCallback) {
                                var data = await that.showPasswordConfirmDialog(task.name);
                                task.createTaskCallback(data);
                            }
                        }
                        // After all tasks have been created, you might want to notify the user.
                        that.showMsg('title', _V('ui', 'tasks_created_msg'));
                    });
            }
        } catch (error) {
            console.error('Error checking or creating tasks:', error);
        }
    },
    onOpen: function (a) {
        var that = this;
        SYNOCOMMUNITY.RRManager.AppWindow.superclass.onOpen.call(this, a);
        this.onRunTaskMountLoaderDiskClick();
        this.API.callCustomScript('getConfig.cgi').then((responseText) => {
            var configName = 'rrConfig';
            that[configName] = responseText;
            that.populateSystemInfoPanel(that[configName]);
            //populate rr config path
            that['rrManagerConfig'] = that[configName]['rr_manager_config'];
            that['opts']['params']['path'] = `/${that['rrManagerConfig']['SHARE_NAME']}/${that['rrManagerConfig']['RR_TMP_DIR']}`;

            that.API.getSytemInfo().then((x) => {
                that['synoInfo'] = x.data;
                Ext.getCmp('lbSystemInfo').setValue(`Model: ${x?.data?.model}, RAM: ${x?.data?.ram} Gb, DSM version: ${x?.data?.version_string} `);
            });
            this.__checkDownloadFolder(this.__checkRequiredTasks.bind(this));
        });
        that.API.getPackagesList().then((response) => {
            var rrManagerPackage = response.data.packages.find(p => p.id == 'rr-manager');
            Ext.getCmp('lbRrManagerVersion')?.setValue(`${rrManagerPackage?.version}`);
        });
    },

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
                url: `${that.API._baseUrl}api=SYNO.FileStation.Upload&method=upload&version=2&SynoToken=${localStorage['SynoToken']}`,
                defaultHeaders: l,
                timeout: null
            });
            var m = this.conn.request({
                headers: s,
                html5upload: !0,
                chunkmode: t.chunkmode,
                uploadData: n,
                success: (x) => {
                    that?.getEl()?.unmask();
                    this.showPrompt(`File has been successfully uploaded to the downloads folder.
                                Would you like to run update procedure?`, "Confirm update", x => this.onRunRrUpdateManuallyClick());
                },
                failure: (x) => {
                    that?.getEl()?.unmask();
                    that.showMsg("title", "Error file uploading.");
                    console.log(x);
                },
                progress: (x) => { },
            });
        }
    },
    MAX_POST_FILESIZE: Ext.isWebKit ? -1 : window.console && window.console.firebug ? 20971521 : 4294963200,
    onUploadFile: function (e, that) {
        //create rr tmp folder
        SYNO.API.currentManager.requestAPI("SYNO.FileStation.CreateFolder", "create", "2", {
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
    }
});


