export default
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
