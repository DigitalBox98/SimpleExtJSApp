export default 
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
                    items: [{
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
                    }, {
                        fieldLabel: 'paturl',
                        name: 'paturl',
                        allowBlank: false,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'patsum',
                        name: 'patsum',
                        allowBlank: false,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'layout',
                        name: 'layout',
                        allowBlank: true,
                        xtype: 'syno_textfield',
                    }, {
                        fieldLabel: 'keymap',
                        name: 'keymap',
                        allowBlank: true,
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