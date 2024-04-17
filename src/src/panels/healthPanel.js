Ext.define("SYNOCOMMUNITY.RRManager.Overview.HealthPanel", {
    extend: "SYNO.ux.Panel",
    helper: SYNOCOMMUNITY.RRManager.UpdateWizard.Helper,
    formatString: function (str, ...args) {
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    },

    constructor: function (e) {
        this.appWin = e.appWin;
        this.owner = e.owner;
        this.callCustomScript = this.owner.callCustomScript.bind(this.owner);
        this.callParent([this.fillConfig(e)]);
    },
    onDataReady: function () {
        let status = "normal";
        this.iconTemplate.overwrite(this.getComponent("icon").getEl(), { status: status }),
            this.titleTemplate.overwrite(this.upperPanel.getComponent("title").getEl(), {
                status: status,
            }),
            this.updateDescription("current");
        this.getComponent("rrActionsPanel")?.setVisible(true);
        this.owner.fireEvent("data_ready");
    },
    createUploadPannel: function () {
        var myFormPanel = new Ext.form.FormPanel({
            title: this.helper.V("ui", "lb_select_update_file"),
            fileUpload: true,
            name: 'upload_form',
            border: !1,
            bodyPadding: 10,
            items: [{
                xtype: 'syno_filebutton',
                text: this.helper.V('ui', 'select_file'),
                name: 'filename',
                allowBlank: false,
            }],
        });
        this["upload_form"] = myFormPanel;
        return myFormPanel;
    },
    _baseUrl: 'webapi/entry.cgi?',
    sendArray: function (formData, fileDetails, fileData, chunkDetails, tempFile) {
        var self = this;
        var headers = {}, requestParams = {};
        var uploadData;

        if (fileDetails.status !== "CANCEL") {
            if (fileDetails.chunkmode) {
                headers = {
                    "Content-Type": "multipart/form-data; boundary=" + formData.boundary
                };
                requestParams = {
                    "X-TYPE-NAME": "SLICEUPLOAD",
                    "X-FILE-SIZE": fileDetails.size,
                    "X-FILE-CHUNK-END": chunkDetails.total <= 1 || chunkDetails.index === chunkDetails.total - 1 ? "true" : "false"
                };
                if (tempFile) {
                    Ext.apply(requestParams, {
                        "X-TMP-FILE": tempFile
                    });
                }
                if (window.XMLHttpRequest.prototype.sendAsBinary) {
                    uploadData = formData.formdata + (fileData !== "" ? fileData : "") + "\r\n--" + formData.boundary + "--\r\n";
                } else if (window.Blob) {
                    var data = new Uint8Array(formData.formdata.length + fileData.length + "\r\n--" + formData.boundary + "--\r\n".length);
                    data.set(new TextEncoder().encode(formData.formdata + fileData + "\r\n--" + formData.boundary + "--\r\n"));
                    uploadData = data;
                }
            } else {
                formData.append("size", fileDetails.size);
                fileDetails.name ? formData.append(this.opts.filefiledname, fileDetails, this.opts.params.filename) : formData.append(this.opts.filefiledname, fileDetails.file);
                uploadData = formData;
            }
            this.conn = new Ext.data.Connection({
                method: 'POST',
                url: `${this._baseUrl}api=SYNO.FileStation.Upload&method=upload&version=2&SynoToken=${localStorage['SynoToken']}`,
                defaultHeaders: headers,
                timeout: null
            });
            var request = this.conn.request({
                headers: requestParams,
                html5upload: true,
                chunkmode: fileDetails.chunkmode,
                uploadData: uploadData,
                success: (response) => {
                    self.appWin.clearStatusBusy();
                    self.appWin.getMsgBox().confirmDelete(
                        self.appWin.title,
                        self.helper.V('ui', 'file_uploading_succesfull_msg'),
                        (result) => {
                            if (result === "yes") {
                                self.owner.onRunRrUpdateManuallyClick();
                            }
                        },
                        formData,
                        {
                            yes: {
                                text: "Yes",
                                btnStyle: "red",
                            },
                            no: { text: Ext.MessageBox.buttonText.no },
                        }
                    );
                },
                failure: (response) => {
                    self.appWin.clearStatusBusy();
                    self.showMsg(self.helper.V('ui', 'file_uploading_failed_msg'));
                    console.error(self.helper.V('ui', 'file_uploading_failed_msg'));
                    console.log(response);
                },
                progress: (progressEvent) => {
                    const percentage = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
                    self.appWin.clearStatusBusy();
                    self.appWin.setStatusBusy({ text: `${_T("common", "loading")}. ${self.helper.V("ui", "completed")} ${percentage}%.` }, percentage);
                },
            });
        }
    },
    MAX_POST_FILESIZE: Ext.isWebKit ? -1 : window.console && window.console.firebug ? 20971521 : 4294963200,
    showMsg: function (msg) {
        //TODO: use native alerts
        alert(msg);
    },
    showUpdateUploadDialog: function () {
        that = this;
        var window = new SYNO.SDS.ModalWindow({
            id: "upload_file_dialog",
            title: this.helper.V("ui", "upload_file_dialog_title"),
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
                            that.showMsg(this.helper.V('ui', 'upload_update_file_form_validation_invalid_msg'));
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
        let rrConfigJson = localStorage.getItem('rrConfig');
        let rrConfig = JSON.parse(rrConfigJson);
        let rrManagerConfig = rrConfig.rr_manager_config;
        this.opts.params.path = `/${rrManagerConfig.SHARE_NAME}/${rrManagerConfig.RR_TMP_DIR}`;
        let file = new File([e], this.opts.params.filename);
        let isChunkMode = false;
        if (-1 !== this.MAX_POST_FILESIZE && file.size > this.MAX_POST_FILESIZE && isChunkMode)
            this.onError({
                errno: {
                    section: "error",
                    key: "upload_too_large"
                }
            }, file);
        else {
            let formData = this.prepareStartFormdata(file);
            if (file.chunkmode) {
                let chunkSize = this.opts.chunksize;
                let totalChunks = Math.ceil(file.size / chunkSize);
                this.onUploadPartailFile(formData, file, {
                    start: 0,
                    index: 0,
                    total: totalChunks
                })
            } else
                this.sendArray(formData, file)
        }
    },
    opts: {
        chunkmode: false,
        filefiledname: "file",
        file: function (file) {
            var createFileObject = function (file, params, id, dtItem) {
                var modifiedParams = SYNO.SDS.copy(params || {});
                var lastModifiedTime = SYNO.webfm.utils.getLastModifiedTime(file);

                if (lastModifiedTime) {
                    modifiedParams = Ext.apply(modifiedParams, {
                        mtime: lastModifiedTime
                    });
                }

                return {
                    id: id,
                    file: file,
                    dtItem: dtItem,
                    name: file.name || file.fileName,
                    size: file.size || file.fileSize,
                    progress: 0,
                    status: "NOT_STARTED",
                    params: modifiedParams,
                    chunkmode: false
                };
            }

            var lastModifiedTime = SYNO.webfm.utils.getLastModifiedTime(file);
            var fileObject = new createFileObject(file, { mtime: lastModifiedTime });
            return fileObject;
        },
        //TODO: remove hard coding
        params: {
            // populating from the config in onOpen
            path: '',
            //TODO: remove hardcoding of the filename
            filename: "update.zip",
            overwrite: true
        }
    },
    prepareStartFormdata: function (file) {
        const isChunkMode = (-1 !== this.MAX_POST_FILESIZE && file.size > this.MAX_POST_FILESIZE);
        if (isChunkMode) {
            const boundary = `----html5upload-${new Date().getTime()}${Math.floor(65535 * Math.random())}`;
            let contentPrefix = "";

            if (this.opts.params) {
                for (const paramName in this.opts.params) {
                    if (this.opts.params.hasOwnProperty(paramName)) {
                        contentPrefix += `--${boundary}\r\n`;
                        contentPrefix += `Content-Disposition: form-data; name="${paramName}"\r\n\r\n`;
                        contentPrefix += `${unescape(encodeURIComponent(this.opts.params[paramName]))}\r\n`;
                    }
                }
            }

            if (file.params) {
                for (const paramName in file.params) {
                    if (file.params.hasOwnProperty(paramName)) {
                        contentPrefix += `--${boundary}\r\n`;
                        contentPrefix += `Content-Disposition: form-data; name="${paramName}"\r\n\r\n`;
                        contentPrefix += `${unescape(encodeURIComponent(file.params[paramName]))}\r\n`;
                    }
                }
            }

            const filename = unescape(encodeURIComponent(file.name));
            contentPrefix += `--${boundary}\r\n`;
            contentPrefix += `Content-Disposition: form-data; name="${this.opts.filefiledname || "file"}"; filename="${filename}"\r\n`;
            contentPrefix += 'Content-Type: application/octet-stream\r\n\r\n';

            return {
                formData: contentPrefix,
                boundary: boundary
            };
        } else {
            const formData = new FormData();

            if (this.opts.params) {
                for (const paramName in this.opts.params) {
                    if (this.opts.params.hasOwnProperty(paramName)) {
                        formData.append(paramName, this.opts.params[paramName]);
                    }
                }
            }

            if (file.params) {
                for (const paramName in file.params) {
                    if (file.params.hasOwnProperty(paramName)) {
                        formData.append(paramName, file.params[paramName]);
                    }
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
            title: this.helper.V('ui', 'section_rr_actions'),
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
                                value: this.helper.V('ui', 'run_update'),
                                width: 140
                            }, {
                                xtype: 'syno_button',
                                btnStyle: 'green',
                                text: this.helper.V('ui', 'upload_file_dialog_title'),
                                handler: this.showUpdateUploadDialog.bind(this)
                            }, {
                                xtype: 'syno_button',
                                btnStyle: 'green',
                                text: "New Upload Update",
                                handler: this.showUpdateUploadWizard.bind(this)
                            }]
                        },
                    ],
                    deferredRender: true
                },
            ]
        });
    },
    //TODO: modify to zip
    tabType: "zip",
    showUpdateUploadWizard: function () {
        var a = new SYNOCOMMUNITY.RRManager.UpdateWizard.Wizard({
            owner: this.appWin,
            //TODO: use localized text
            title: "Add Update*.zip file",
            imageType: this.tabType,
            pollingWindow: this.owner,
            records: {
                data: {
                    items: []
                }
            } //this.overviewPanel.store,
        });
        a.open();
    },
    fillConfig: function (e) {
        this.poolLinkId = Ext.id();
        this.iconTemplate = this.createIconTpl();
        this.titleTemplate = this.createTitleTpl();
        this.upperPanel = this.createUpperPanel();
        this.lowerPanel = this.createLowerPanel();

        this.descriptionMapping = {
            normal: this.helper.V('ui', 'greetings_text'),
            target_abnormal: []
        };

        const panelConfig = {
            layout: "hbox",
            cls: "iscsi-overview-health-panel",
            autoHeight: true,
            items: [
                { xtype: "box", itemId: "icon", cls: "health-icon-block" },
                {
                    xtype: "syno_panel",
                    itemId: "rightPanel",
                    cls: "health-text-block",
                    flex: 1,
                    height: 180,
                    layout: "vbox",
                    layoutConfig: { align: "stretch" },
                    items: [this.upperPanel, this.lowerPanel],
                },
                {
                    xtype: "syno_panel",
                    itemId: "rrActionsPanel",
                    flex: 1,
                    height: 96,
                    hidden: true,
                    layout: "vbox",
                    layoutConfig: { align: "stretch" },
                    items: [this.createActionsSection()],
                },
            ],
            listeners: { scope: this, data_ready: this.onDataReady },
        };
        return Ext.apply(panelConfig, e), panelConfig;

    },
    createIconTpl: function () {
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
                },
                {
                    xtype: "syno_displayfield",
                    itemId: "desc3",
                    cls: "health-text-content",
                    htmlEncode: !1,
                },
            ],
        });
    },
    updateDescription: function (status) {
        const self = this;
        this.descriptions = [];
        let description,
            statusDescription,
            index = -1;
        const
            descriptionCount = this.descriptions.length,
            rightPanel = this.getComponent("rightPanel"),
            descriptionField = this.lowerPanel.getComponent("desc"),
            versionField = this.lowerPanel.getComponent("desc3"),
            rrVersionField = this.lowerPanel.getComponent("desc2"),
            leftButton = this.upperPanel.getComponent("leftBtn"),
            rightButton = this.upperPanel.getComponent("rightBtn"),
            initialHeight = descriptionField.getHeight();
        let panelHeight = rightPanel.getHeight(),
            isHeightChanged = false;
        statusDescription = this.descriptionMapping.normal;
        descriptionField.setValue(self.owner.systemInfoTxt);
        versionField.setValue(self.owner.rrManagerVersionText);
        rrVersionField.setValue(`💊RR v. ${self.owner.rrVersionText}`);

        const updatedHeight = descriptionField.getHeight();
        if (
            (updatedHeight !== initialHeight && ((panelHeight = panelHeight - initialHeight + updatedHeight), (isHeightChanged = true)),
                isHeightChanged && ((rightPanel.height = panelHeight), this.doLayout(), this.owner.doLayout()),
                this.descriptions.length <= 1)
        )
            return leftButton.hide(), void rightButton.hide();
        (leftButton.hidden || rightButton.hidden) && (leftButton.show(), rightButton.show(), this.doLayout());
    },
    prepareSummaryStatus: function (status, data) {
        // Function body goes here
    },
});