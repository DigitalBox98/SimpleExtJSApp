export default
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