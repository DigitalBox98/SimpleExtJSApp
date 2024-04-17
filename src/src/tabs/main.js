export default
Ext.define("SYNOCOMMUNITY.RRManager.Overview.Main", {
    extend: "SYNO.ux.Panel",
    helper: SYNOCOMMUNITY.RRManager.UpdateWizard.Helper,
    formatString: function (str, ...args) {
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },
    _prefix: '/webman/3rdparty/rr-manager/',
    handleFileUpload: function (jsonData) {
        this._handleFileUpload(jsonData).then(x => {
            this.runScheduledTask('ApplyRRConfig');
            this.showMsg(this.helper.V('ui', 'rr_config_applied'));
            this.appWin.clearStatusBusy();
        });
    },
    _handleFileUpload: function (jsonData) {
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
    runScheduledTask: function (taskName) {
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
    constructor: function (e) {
        const t = this;
        this.installed = false;
        (this.appWin = e.appWin),
            (this.appWin.handleFileUpload = this.handleFileUpload.bind(this)),
            (this.appWin.runScheduledTask = this.runScheduledTask.bind(this)),
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
    }, _getRrConfig: function () {
        const rrConfigJson = localStorage.getItem('rrConfig');
        return JSON.parse(rrConfigJson);
    },
    __checkDownloadFolder: function (callback) {
        var self = this;

        const rrConfig = this._getRrConfig();
        const config = rrConfig.rr_manager_config;
        this.getSharesList().then(x => {
            var shareName = `/${config['SHARE_NAME']}`;
            var sharesList = x.shares;
            var downloadsShareMetadata = sharesList.find(x => x.path.toLowerCase() == shareName.toLowerCase());
            if (!downloadsShareMetadata) {
                var msg = this.formatString(this.helper.V('ui', 'share_notfound_msg'), config['SHARE_NAME']);
                self.appWin.setStatusBusy({ text: this.helper.V('ui', 'checking_dependencies_loader') });
                self.showMsg(msg);
                return;
            }
            if (callback) callback();
        });
    },
    getPasswordConfirm: function (data) {
        self = this;
        return new Promise((resolve, reject) => {
            let args = {
                api: "SYNO.Core.User.PasswordConfirm",
                method: "auth",
                version: 2,
                params: {
                    password: data
                }, callback: function (success, message) {
                    success ? resolve(message?.SynoConfirmPWToken)
                        : reject('Unable to create task!');
                },
            };
            self.sendWebAPI(args);
        });
    },
    __checkRequiredTasks: async function () {
        var self = this;
        var requiredTasks = [{
            name: "RunRrUpdate",
            createTaskCallback: self.createAndRunSchedulerTask.bind(this)
        }, {
            name: "SetRootPrivsToRrManager",
            createTaskCallback: self.createAndRunSchedulerTaskSetRootPrivilegesForRrManager.bind(this)
        }, {
            name: "ApplyRRConfig",
            createTaskCallback: self.createSchedulerTaskApplyRRConfig.bind(this)
        }];

        try {
            let response = await self.getTaskList();
            var tasks = response.tasks;
            var tasksToCreate = requiredTasks.filter(task => !tasks.find(x => x.name === task.name));
            if (tasksToCreate.length > 0) {
                let tasksNames = tasksToCreate.map(task => task.name).join(', ');
                async function craeteTasks() {
                    for (let task of tasksToCreate) {
                        if (task.createTaskCallback) {
                            var data = await self.showPasswordConfirmDialog(task.name);
                            task.createTaskCallback(data);
                        }
                    }
                    // After all tasks have been created, you might want to notify the user.
                    self.showMsg(self.helper.V('ui', 'tasks_created_msg'));
                    self.owner.clearStatusBusy();
                }
                self.appWin.getMsgBox().confirm(
                    "Confirmation",
                    self.formatString(
                        self.formatString(self.helper.V('ui', 'required_tasks_is_missing'), tasksNames),
                        self.helper.V('ui', 'required_components_missing')),
                    (userResponse) => {
                        if ("yes" === userResponse) {
                            craeteTasks();
                        } else {
                            Ext.getCmp(self.id).getEl().mask(self.formatString(self.helper.V('ui', 'required_components_missing_spinner_msg'), tasksNames), "x-mask-loading");
                        }
                    }, self,
                    {
                        cancel: { text: _T("common", "cancel") },
                        yes: { text: _T("common", "agree"), btnStyle: 'red' }
                    }, {
                    icon: "confirm-delete-icon"
                }
                );
            }
        } catch (error) {
            console.error('Error checking or creating tasks:', error);
        }
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
    createAndRunSchedulerTask: function (data) {
        this.getPasswordConfirm(data).then(data => {
            //TODO: remove hardcoded update.zip file name
            this.createTask("RunRrUpdate",
                ".%20%2Fvar%2Fpackages%2Frr-manager%2Ftarget%2Fapp%2Fconfig.txt%20%26%26%20%2Fusr%2Fbin%2Frr-update.sh%20updateRR%20%22%24UPLOAD_DIR_PATH%24RR_TMP_DIR%22%2Fupdate.zip%20%2Ftmp%2Frr_update_progress",
                data
            );
        });
    },
    createAndRunSchedulerTaskSetRootPrivilegesForRrManager: function (data) {
        that = this;
        this.getPasswordConfirm(data).then(data => {
            this.createTask("SetRootPrivsToRrManager",
                "sed%20-i%20's%2Fpackage%2Froot%2Fg'%20%2Fvar%2Fpackages%2Frr-manager%2Fconf%2Fprivilege%20%26%26%20synopkg%20restart%20rr-manager",
                data
            ).then(x => {
                that.sendRunSchedulerTaskWebAPI(data);
            });
        });
    },
    createSchedulerTaskApplyRRConfig: function (data) {
        this.getPasswordConfirm(data).then(data => {
            this.createTask("ApplyRRConfig",
                "cp%20%2Ftmp%2Fuser-config.yml%20%2Fmnt%2Fp1%2Fuser-config.yml%20%26%26%20cp%20%2Ftmp%2F.build%20%2Fmnt%2Fp1%2F.build",
                data
            );
        });
    },
    createTask: function (task_name, operation, token) {
        that = this;
        return new Promise((resolve, reject) => {
            let params = {
                task_name: task_name,
                owner: { 0: "root" },
                event: "bootup",
                enable: false,
                depend_on_task: "",
                notify_enable: false,
                notify_mail: "",
                notify_if_error: false,
                operation_type: "script",
                operation: decodeURIComponent(operation)
            };

            if (token != "") {
                params.SynoConfirmPWToken = token
            }

            let args = {
                api: token != "" ? "SYNO.Core.EventScheduler.Root" : "SYNO.Core.EventScheduler",
                method: "create",
                version: 1,
                params: params,
                callback: function (success, message) {
                    success ? resolve(message) : reject('Unable to create task!');
                },
                scope: this,
            };
            that.sendWebAPI(args);
        });
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
            args.params.SynoConfirmPWToken = token
        }
        this.sendWebAPI(args);
    },
    getSharesList: function () {
        that = this;
        return new Promise((resolve, reject) => {
            let params = {
                filetype: 'dir', // URL-encode special characters if needed
                sort_by: 'name',
                check_dir: true,
                additional: '["real_path","owner","time","perm","mount_point_type","sync_share","volume_status","indexed","hybrid_share","worm_share"]',
                enum_cluster: true,
                node: 'fm_root'
            };
            let args = {
                api: 'SYNO.FileStation.List',
                method: 'list_share',
                version: 2,
                params: params,
                callback: function (success, message) {
                    success ? resolve(message) : reject('Unable to get getSytemInfo!');
                }
            };
            that.sendWebAPI(args);
        });
    },
    getTaskList: function () {
        that = this;
        return new Promise((resolve, reject) => {
            let params = {
                sort_by: "next_trigger_time",
                sort_direction: "ASC",
                offset: 0,
                limit: 50
            };
            let args = {
                api: 'SYNO.Core.TaskScheduler',
                method: 'list',
                version: 3,
                params: params,
                callback: function (success, message) {
                    success ? resolve(message) : reject('Unable to get packages!');
                }
            };
            that.sendWebAPI(args);
        });
    },
    checkRRVersion: function () {
        return this.callCustomScript('getRrReleaseInfo.cgi');
    },
    showPrompt: function (title, message, text, yesCallback) {
        var window = new SYNO.SDS.ModalWindow({
            closeAction: "hide",
            cls: "x-window-dlg",
            layout: 'anchor',
            width: 750,
            height: 600,
            resizable: false,
            modal: true,
            title: title,
            buttons: [{
                text: this.helper.T("common", "alt_cancel"),
                // Handle Cancel
                handler: function () {
                    window.close();
                }
            }, {
                text: this.helper.V("ui", "alt_confirm"),
                itemId: "confirm",
                btnStyle: "blue",
                // Handle Confirm
                handler: function () {
                    if (yesCallback) yesCallback();
                    window.close();
                }
            }],
            items: [
                {
                    // Display the prompt message
                    xtype: 'box',
                    autoEl: { tag: 'div', html: message },
                    style: 'margin: 10px;',
                    anchor: '100%'
                },
                {
                    // Display changelog title
                    xtype: 'syno_displayfield',
                    anchor: '100%',
                    style: 'margin: 10px; font-weight: bold;',
                    value: 'Changelog:'
                },
                {
                    // Display the changelog in a scrollable view
                    xtype: 'box',
                    autoEl: { tag: 'div', html: text.replace(/\n/g, '<br>') },
                    style: 'margin: 10px; overflow-y: auto; border: 1px solid #ccc; padding: 5px;',
                    height: '75%', // Fixed height for the scrollable area
                    anchor: '100%'
                }
            ]
        });
        window.open();
    },
    onActivate: function () {
        const self = this;
        if (this.loaded) return;
        self.appWin.setStatusBusy(null, null, 50);
        self.runScheduledTask('MountLoaderDisk');
        (async () => {
            self.systemInfo = await self.getSytemInfo();
            self.packages = await self.getPackagesList();
            self.rrCheckVersion = await self.checkRRVersion();
            if (self.systemInfo && self.packages) {
                self.systemInfoTxt = `Model: ${self.systemInfo?.model}, RAM: ${self.systemInfo?.ram} MB, DSM version: ${self.systemInfo?.version_string} `;
                const rrManagerPackage = self.packages.packages.find((packageInfo) => packageInfo.id == 'rr-manager');
                self.rrManagerVersionText = `🛡️RR Manager v.: ${rrManagerPackage?.version}`;
                self.panels.healthPanel.fireEvent(
                    "select",
                    self.panels.healthPanel.clickedBox
                );
                await self.updateAllForm();
                self.rrVersionText = self.rrConfig.rr_version;
                if (!self.installed) {
                    //create rr tmp folder
                    self.rrManagerConfig = self.rrConfig.rr_manager_config;
                    SYNO.API.currentManager.requestAPI('SYNO.FileStation.CreateFolder', "create", "2", {
                        folder_path: `/${self.rrManagerConfig.SHARE_NAME}`,
                        name: self.rrManagerConfig.RR_TMP_DIR,
                        force_parent: false
                    });
                    self.installed = true;
                }

                self.panels.healthPanel.fireEvent("data_ready");
                self.loaded = true;
            }
            function donwloadUpdate() {
                SYNO.API.currentManager.requestAPI('SYNO.DownloadStation2.Task', "create", "2", {
                    type: "url",
                    destination: `${self.rrManagerConfig.SHARE_NAME}/${self.rrManagerConfig.RR_TMP_DIR}`,
                    create_list: true,
                    url: [self.rrCheckVersion.updateAllUrl]
                });
            }
            if (self?.rrCheckVersion?.status == "update available"
                && self?.rrCheckVersion?.tag != "null"
                && self.rrConfig.rr_version !== self?.rrCheckVersion?.tag) {
                self.showPrompt(self.helper.V('ui', 'prompt_update_available_title'),
                    self.formatString(self.helper.V('ui', 'prompt_update_available_message'), self.rrCheckVersion.tag), self.rrCheckVersion.notes, donwloadUpdate);
            }
        })();
        self.__checkDownloadFolder(self.__checkRequiredTasks.bind(self));
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
    showMsg: function (msg) {
        this.owner.getMsgBox().alert("title", msg);
    },
    onRunRrUpdateManuallyClick: function () {
        const self = this;
        const rrConfigJson = localStorage.getItem('rrConfig');
        const rrConfig = JSON.parse(rrConfigJson);
        const rrManagerConfig = rrConfig.rr_manager_config;
        //TODO: remove hardcoded update.zip file name
        const url = `${rrManagerConfig?.UPLOAD_DIR_PATH}${rrManagerConfig?.RR_TMP_DIR}/update.zip`;
        this.getUpdateFileInfo(url).then((responseText) => {
            if (!responseText.success) {
                self.owner.getEl()?.unmask();
                this.showMsg(self.formatString(self.helper.V('ui', 'unable_update_rr_msg'), responseText?.error ?? "No response from the readUpdateFile.cgi script."));
                return;
            }
            const configName = 'rrUpdateFileVersion';
            self.owner[configName] = responseText;
            const currentRrVersion = rrConfig.rr_version;
            const updateRrVersion = self.owner[configName].updateVersion;

            async function runUpdate() {
                //show the spinner
                self.owner.getEl().mask(_T("common", "loading"), "x-mask-loading");
                self.appWin.runScheduledTask('RunRrUpdate');
                const maxCountOfRefreshUpdateStatus = 350;
                let countUpdatesStatusAttemp = 0;

                const updateStatusInterval = setInterval(async function () {
                    const checksStatusResponse = await self.callCustomScript('checkUpdateStatus.cgi');
                    if (!checksStatusResponse?.success) {
                        clearInterval(updateStatusInterval);
                        self.owner.getEl()?.unmask();
                        self.showMsg(checksStatusResponse?.status);
                    }
                    const response = checksStatusResponse.result;
                    self.owner.getEl()?.mask(self.formatString(self.helper.V('ui', 'update_rr_progress_msg'), response?.progress ?? "--", response?.progressmsg ?? "--"), 'x-mask-loading');
                    countUpdatesStatusAttemp++;
                    if (countUpdatesStatusAttemp == maxCountOfRefreshUpdateStatus || response?.progress?.startsWith('-')) {
                        clearInterval(updateStatusInterval);
                        self.owner.getEl()?.unmask();
                        self.showMsg(self.formatString(self.helper.V('ui'), response?.progress, response?.progressmsg));
                    } else if (response?.progress == '100') {
                        self.owner.getEl()?.unmask();
                        clearInterval(updateStatusInterval);
                        self.showMsg(self.helper.V('ui', 'update_rr_completed'));
                    }
                }, 1500);
            }
            self.appWin.getMsgBox().confirmDelete(
                "Confirmation",
                self.formatString(self.helper.V('ui', 'update_rr_confirmation'), currentRrVersion, updateRrVersion),
                (userResponse) => {
                    if ("yes" === userResponse) {
                        runUpdate();
                    }
                },
                e,
                {
                    yes: {
                        text: "Proceed",
                        btnStyle: "red",
                    },
                    no: { text: "Cancel" },
                }
            );
        }).catch(error => {
            this.showMsg(`Error. ${error}`);
        });
    },
    updateAllForm: async function () {
        that = this.appWin;
        this.owner.setStatusBusy();
        try {
            const rrConfig = await this.getConf();
            var configName = 'rrConfig';
            that[configName] = rrConfig;
            this[configName] = rrConfig;

            localStorage.setItem(configName, JSON.stringify(rrConfig));
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
    onDataReady: async function () {
        const e = this;
        e.loaded = true;
        // need to clean the spinner when form has been loaded
        e.appWin.clearStatusBusy();
    },
});