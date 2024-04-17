export default
Ext.define("SYNOCOMMUNITY.RRManager.UpdateWizard.NewImagePanel", {
    extend: "SYNO.SDS.Utils.FormPanel",
    uploadTimeout: 86400000,
    helper: SYNOCOMMUNITY.RRManager.UpdateWizard.Helper,
    exts: {
        zip: [".zip"],
    },
    constructor: function (a) {
        this.callParent([this.fillConfig(a)]);
    },
    fillConfig: function (a) {
        this.store = this.createStore();
        this.imageType = a.imageType;
        this.existNameList = this.createExistNameList(a.records);
        this.gridPanel = this.createGridPanel(a);
        this.tbar = this.createTBar(a);
        var b = {
            cls: "image-new-image-panel",
            tbar: this.tbar,
            labelWidth: 204,
            labelPad: 20,
            fileUpload: true,
            trackResetOnLoad: true,
            layout: "fit",
            items: [this.gridPanel],
        };
        Ext.apply(b, a);
        return b;
    },
    createTBar: function (a) {
        return new SYNO.ux.Toolbar({
            items: [
                {
                    xtype: "syno_filebutton",
                    buttonOnly: true,
                    itemId: "btn_from_PC",
                    id: (this.form_pc_id = Ext.id()),
                    buttonText: this.helper.T("ui", "from_pc"),
                    listeners: {
                        scope: this,
                        afterrender: function (b) {
                            b.el.set({
                                accept: this.getFileExtsByImageType().toString(),
                                multiple: true,
                            });
                            this.mon(b.el, "change", this.onFromPC, this);
                        },
                    },
                },
                {
                    xtype: "syno_button",
                    itemId: "btn_from_DS",
                    id: (this.form_ds_id = Ext.id()),
                    text: this.helper.T("ui", "from_ds"),
                    handler: this.onFromDS,
                    scope: this,
                },
                // {
                //     xtype: "syno_button",
                //     itemId: "btn_download_vdsm",
                //     id: (this.download_vdsm_id = Ext.id()),
                //     text: this.helper.T("image", "download_syno_vdsm"),
                //     hidden: "vdsm" !== a.imageType,
                //     scope: this,
                //     handler: this.onDownloadVDSM,
                // },
            ],
        });
    },
    createStore: function () {
        var a = [
            { name: "name" },
            { name: "path" },
            { name: "get_patch_by" },
            { name: "action" },
            { name: "input_elm" },
            { name: "real_path" },
            { name: "file_size" },
            { name: "file" },
        ];
        return new Ext.data.JsonStore({
            autoDestroy: true,
            idProperty: "name",
            root: "",
            fields: a,
        });
    },
    createGridPanel: function (a) {
        this.nameTextField = new SYNO.ux.TextField({
            name: "name",
            allowBlank: false,
            itemId: "name_field",
            maxlength: 127,
            vtype: "taskname",
            selectOnFocus: true,
            listeners: {
                scope: this,
                focus: function () {
                    var b = this.gridPanel
                        .getView()
                        .getCell(this.nameTextField.gridEditor.row, 0);
                    var c = b.itip;
                    if (!c) {
                        this.nameTextField.clearInvalid();
                    } else {
                        this.nameTextField.markInvalid(c);
                    }
                },
            },
        });
        return new SYNO.ux.EditorGridPanel({
            cls: "vm-textfield-grid",
            store: this.store,
            flex: 1,
            clicksToEdit: 1,
            enableHdMenu: false,
            enableColumnMove: false,
            colModel: new Ext.grid.ColumnModel({
                defaults: { menuDisabled: true },
                columns: [
                    {
                        header: this.helper.T("ui", "image_name"),
                        dataIndex: "name",
                        align: "left",
                        editor: this.nameTextField,
                    },
                    {
                        header: this.helper.T("common", "file"),
                        dataIndex: "real_path",
                        renderer: this.helper.toolTipRenderer,
                    },
                    {
                        header: this.helper.T("common", "size"),
                        dataIndex: "file_size",
                        renderer: function (b) {
                            if (0 >= b) {
                                return "-";
                            }
                            return this.helper.diskSizeRenderer(b);
                        }.createDelegate(this),
                    },
                    {
                        xtype: "actioncolumn",
                        header: this.helper.T("common", "action"),
                        dataIndex: "action",
                        scope: this,
                        items: [
                            {
                                iconCls: "vm-fileupload-delete-icon",
                                handler: function (d, e, c) {
                                    var b = this.store.getAt(e).get("input_elm");
                                    this.store.removeAt(e);
                                    if (Ext.isObject(b)) {
                                        Ext.removeNode(Ext.getDom(b));
                                    }
                                    this.nameValidate();
                                }.createDelegate(this),
                            },
                        ],
                        width: 40,
                        align: "center",
                    },
                ],
            }),
            listeners: {
                scope: this,
                afteredit: function (b) {
                    this.nameValidate();
                },
            },
        });
    },
    createExistNameList: function (b) {
        var c = [];
        var a = b.snapshot || b.data;
        a.items.forEach(function (d) {
            c.push(d.get("name"));
        });
        return c;
    },
    getFileExtsByImageType: function () {
        return this.exts[this.imageType];
    },
    getValues: function () {
        var a = [];
        for (var b = 0; b < this.store.getCount(); b++) {
            var c = this.store.getAt(b);
            a.push({
                get_patch_by: c.get("get_patch_by"),
                name: c.get("name"),
                path: c.get("path"),
                file: c.get("file"),
                file_size: c.get("file_size"),
            });
        }
        return a;
    },
    addStore: function (a) {
        this.store.add(new Ext.data.Record(a));
        this.nameValidate();
    },
    isUniqueExistName: function (a) {
        if (-1 !== this.existNameList.indexOf(a)) {
            return false;
        }
        return true;
    },
    isUniqueNewName: function (a, c) {
        for (var b = 0; b < this.store.getCount(); b++) {
            if (b === c) {
                continue;
            }
            if (a === this.store.getAt(b).get("name")) {
                return false;
            }
        }
        return true;
    },
    nameValidate: function () {
        var isValid = true;
        var errorMessage;
        for (var index = 0; index < this.store.getCount(); index++) {
            var record = this.store.getAt(index);
            var cell = this.gridPanel.getView().getCell(index, 0);
            var invalidCharactersRegex = /([\\\{\}\|\^\[\]\?\=\:\+\/\*\(\)\$\!"#%&',;<>@`~])/;
            if (null !== record.get("name").match(invalidCharactersRegex)) {
                errorMessage = this.helper.T("error", "invalid_name");
            } else {
                if (!this.isUniqueExistName(record.get("name")) || !this.isUniqueNewName(record.get("name"), index)) {
                    errorMessage = this.helper.T("error", "name_conflict");
                }
            }
            var cellFirstChild = Ext.get(Ext.getDom(cell).firstChild);
            cellFirstChild.removeClass("validCell");
            cellFirstChild.removeClass("invalidCell");
            if (errorMessage) {
                cellFirstChild.addClass("invalidCell");
                Ext.getDom(cell).setAttribute("ext:anchor", "top");
                Ext.getDom(cell).itip = errorMessage;
                isValid = false;
            } else {
                cellFirstChild.addClass("validCell");
                Ext.getDom(cell).itip = "";
            }
            errorMessage = "";
        }
        return isValid;
    },
    onDownloadVDSM: function () {
        // var a = new SYNOCOMMUNITY.RRManager.Image.DownloadVDSMWindow({
        //     parent: this,
        //     owner: this.appWin,
        // });
        // a.open();
    },
    onFromPC: function (b, d, c) {
        var a = b.target.files;
        Ext.each(
            a,
            function (f) {
                var e = {
                    input_elm: d,
                    name: f.name.substring(0, f.name.lastIndexOf(".")),
                    path: f.name,
                    real_path: f.name,
                    get_patch_by: "upload",
                    file_size: f.size,
                    file: f,
                };
                if (!this.preCheck(e)) {
                    return true;
                }
                this.addStore(e);
            },
            this
        );
        this.getTopToolbar().getComponent("btn_from_PC").reset();
    },
    onFromDS: function () {
        if (!Ext.isDefined(this.dialog)) {
            var a = this.getFileExtsByImageType().toString().replace(/\./g, "");
            this.dialog = new SYNO.SDS.Utils.FileChooser.Chooser({
                parent: this,
                owner: this.appWin,
                closeOwnerWhenNoShare: true,
                closeOwnerNumber: 0,
                enumRecycle: true,
                superuser: true,
                usage: { type: "open", multiple: true },
                title: this.helper.T("vm", "import_vm_from_ds"),
                folderToolbar: true,
                getFilterPattern: function () {
                    return a;
                },
                treeFilter: this.helper.VMMDSChooserTreeFilter,
                listeners: {
                    scope: this,
                    choose: function (d, b, c) {
                        b.records.forEach(function (f) {
                            var e = {
                                name: f
                                    .get("path")
                                    .substring(
                                        f.get("path").lastIndexOf("/") + 1,
                                        f.get("path").lastIndexOf(".")
                                    ),
                                path: f.get("path"),
                                real_path: _S("hostname") + f.get("path"),
                                get_patch_by: "from_ds",
                                file_size: f.get("filesize"),
                            };
                            if (!this.preCheck(e)) {
                                return true;
                            }
                            this.addStore(e);
                        }, this);
                        this.dialog.close();
                    },
                    close: function () {
                        delete this.dialog;
                    },
                },
            });
        }
        this.dialog.show();
    },
    preCheck: function (a) {
        var b = a.path.substring(a.path.lastIndexOf("."));
        if (-1 === this.getFileExtsByImageType().indexOf(b)) {
            return false;
        }
        return true;
    },
    getNext: function () {
        return this.isValid();
    },
    isValid: function () {
        var c = true;
        var a = this.getValues();
        if (!this.nameValidate()) {
            this.appWin
                .getMsgBox()
                .alert(
                    this.helper.T("app", "displayname"),
                    this.helper.T("error", "invalid_name")
                );
            return false;
        }
        if (0 === a.length) {
            this.appWin
                .getMsgBox()
                .alert(
                    this.helper.T("app", "displayname"),
                    this.helper.T("error", "error_nochoosefile")
                );
            return false;
        }
        var d = { zip: this.exts.zip };
        var b = {
            zip: [".zip"],
        };
        a.forEach(function (i) {
            if ("upload" === i.get_patch_by || "from_ds" === i.get_patch_by) {
                var e = i.path.substr(i.path.lastIndexOf("."));
                var g = d.hasOwnProperty(this.imageType) ? d[this.imageType] : [];
                var h = b.hasOwnProperty(this.imageType)
                    ? b[this.imageType]
                    : Object.values(b).reduce(function (k, j) {
                        return k.concat(j);
                    }, []);
                var f = false;
                g.forEach(function (j) {
                    if (e === j) {
                        f = true;
                    }
                });
                if (f === false) {
                    this.appWin
                        .getMsgBox()
                        .alert(
                            this.helper.T("app", "displayname"),
                            String.format(
                                this.helper.T("error", "image_filename_bad_ext"),
                                h.join(", ")
                            )
                        );
                    c = false;
                    return false;
                }
            }
        }, this);
        return c;
    },
    doCreate: function (a) {
        // this.sendWebAPI({
        //     api: "SYNO.Virtualization.Guest.Image",
        //     method: "create",
        //     version: 2,
        //     params: a,
        //     scope: this,
        //     callback: function (c, b) {
        //         if (!c) {
        //             this.owner.owner
        //                 .getMsgBox()
        //                 .alert("alert", this.helper.getError(b.code));
        //         }
        //         this.nonUploadTaskNum--;
        //         this.checkAllTaskDone();
        //     },
        // });
    },
    doUploadAndCreate: function (c, a) {
        var b = new FormData();
        b.append("file", a);
        // this.sendWebAPI({
        //     api: "SYNO.Virtualization.Guest.Image",
        //     method: "upload_and_create",
        //     version: 1,
        //     params: c,
        //     uploadData: b,
        //     html5upload: true,
        //     timeout: this.uploadTimeout,
        //     scope: this,
        //     callback: function (e, d) {
        //         if (!e) {
        //             this.owner.owner
        //                 .getMsgBox()
        //                 .alert("alert", this.helper.getError(d.code));
        //         }
        //         this.uploadTaskNum--;
        //         this.checkAllTaskDone();
        //     },
        // });
    },
    doImageCreate: function (b) {
        // this.uploadTaskNum = 0;
        // this.nonUploadTaskNum = 0;
        // var a = this.getValues();
        // this.waitingSendTaskNum = a.length;
        // this.uploadTaskNum = a.filter(function (c) {
        //     return "upload" === c.get_patch_by;
        // }).length;
        // this.nonUploadTaskNum = a.length - this.uploadTaskNum;
        // this.uploadErrorFile = [];
        // this.helper.maskLoading(this.appWin);
        // this.helper.maskLoading(this.pollingWindow.getActivateOverviewPanel());
        // a.forEach(function (c) {
        //     var d = {
        //         synovmm_ui_id: SYNO.SDS.Virtualization.Utils.GlobalVar.mainAppId,
        //         image_repos: JSON.stringify(b),
        //         type: this.imageType,
        //         get_patch_by: c.get_patch_by,
        //         name: c.name,
        //         ds_file_path: c.path,
        //     };
        //     if (d.get_patch_by !== "upload") {
        //         this.doCreate(d);
        //         this.waitingSendTaskNum--;
        //         this.checkAllTaskSend();
        //     } else {
        //         this.reader(d, c.file).then(
        //             function (e) {
        //                 this.doUploadAndCreate(e.params, e.file);
        //                 this.waitingSendTaskNum--;
        //                 this.checkAllTaskSend();
        //             }.bind(this),
        //             function (e) {
        //                 this.uploadErrorFile.push(e);
        //                 this.uploadTaskNum--;
        //                 this.waitingSendTaskNum--;
        //                 this.checkAllTaskSend();
        //             }.bind(this)
        //         );
        //     }
        // }, this);
    },
    checkAllTaskSend: function () {
        if (0 !== this.waitingSendTaskNum) {
            return;
        }
        if (0 !== this.uploadErrorFile.length) {
            this.owner.owner
                .getMsgBox()
                .alert(
                    "alert",
                    String.format(
                        this.helper.T("image", "upload_file_missing"),
                        this.uploadErrorFile.join(", ")
                    )
                );
        }
        this.helper.tryUnmaskAndReload(
            this,
            this.pollingWindow.getActivateOverviewPanel(),
            this.pollingWindow.pollingTask
        );
        this.helper.unmask(this.appWin);
        this.appWin.hide();
        this.checkAllTaskDone();
    },
    checkAllTaskDone: function () {
        if (0 === this.uploadTaskNum && 0 === this.nonUploadTaskNum) {
            this.appWin.close();
        }
    },
    reader: function (b, a) {
        return new Promise(function (f, e) {
            var d = a.slice(0, 4);
            if (0 >= d.size) {
                e(b.name);
                return;
            }
            var c = new FileReader();
            c.args = { params: b, file: a };
            c.addEventListener("load", function () {
                f(this.args);
            });
            c.addEventListener("error", function () {
                e(this.args.params.name);
            });
            c.readAsText(d);
        });
    },
    submit: function () {
        var c = this.getValues();
        var d = 0;
        var g = {};
        c.forEach(function (h) {
            d += h.file_size;
        });
        var b = this.appWin.getMsgBox();
        // var f = this.appWin.getValues().storage.image_hosts_and_repos;
        // var a = [];
        // for (var e = 0; e < f.length; e++) {
        //     if (-1 === a.indexOf(f[e].host_id)) {
        //         a.push(f[e].host_id);
        //     }
        // }
        g.file_size = JSON.stringify(d);
        // g.host_ids = a;
        this.helper.maskLoading(this.appWin);
        this.helper.unmask(this.appWin);
        this.doImageCreate();
        // this.sendWebAPI({
        //     api: "SYNO.Virtualization.Cluster",
        //     method: "check_multi_host_upload",
        //     version: 1,
        //     params: g,
        //     scope: this,
        //     callback: function (m, l) {
        //       
        //         if (!m) {
        //             b.alert("alert", this.helper.getError(l.code));
        //             return;
        //         }
        //         if (0 < l.unavailabe_hosts.length) {
        //             var k = "";
        //             for (e = 0; e < l.unavailabe_hosts.length; e++) {
        //                 k = k + "[" + l.unavailabe_hosts[e] + "]";
        //                 if (e !== l.unavailabe_hosts.length - 1) {
        //                     k += ",";
        //                 }
        //             }
        //             b.alert(
        //                 "alert",
        //                 String.format(
        //                     this.helper.T("error", "guest_image_upload_no_available_repo"),
        //                     k
        //                 )
        //             );
        //         }
        //         if (0 < l.availabe_host_ids.length) {
        //             var i = [];
        //             for (e = 0; e < l.availabe_host_ids.length; e++) {
        //                 for (var h = 0; h < f.length; h++) {
        //                     if (l.availabe_host_ids[e] === f[h].host_id) {
        //                         i.push(f[h].repo_id);
        //                     }
        //                 }
        //             }
        //             this.doImageCreate(i);
        //         }
        //     },
        // });
    },
});
