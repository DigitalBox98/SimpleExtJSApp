export default 
Ext.define("SYNOCOMMUNITY.RRManager.Debug.GeneralTab", {
    extend: "SYNO.SDS.Utils.FormPanel",
    constructor: function (e) {
        this.getConf = e.owner.getConf.bind(e.owner);
        this.callParent([this.fillConfig(e)])
    },
    fillConfig: function (e) {
        this.suspendLcwPrompt = !1;
        const t = {
            title: "General",
            name: 'debugGeneral',
            id: 'debugGeneral',
            items: [new SYNO.ux.FieldSet({
                title: 'CMD Line',
                collapsible: true,
                collapsed: false,
                name: 'cmdLine',
                id: 'cmdLine',
                columns: 2,
                items: [],
            }), new SYNO.ux.FieldSet({
                title: 'Ethernet Interfaces',
                collapsible: true,
                name: 'ethernetInterfaces',
                id: 'ethernetInterfaces',
                columns: 2,
                items: [],
            }), new SYNO.ux.FieldSet({
                title: 'Syno Mac Addresses',
                collapsible: true,
                name: 'macAdresses',
                id: 'macAdresses',
                columns: 2,
                items: [],
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
        self = this;
        if (self.loaded) return;
        this.getConf().then((e) => {
            var config = e.result;
            var cmdLineFieldSet = Ext.getCmp('cmdLine');
            Object.keys(config.bootParameters).forEach((key) => {
                cmdLineFieldSet.add(
                    {
                        fieldLabel: key,
                        name: key,
                        xtype: 'syno_displayfield',
                        value: config.bootParameters[key]
                    });
            });
            cmdLineFieldSet.doLayout();

            var ethernetInterfacesFieldSet = Ext.getCmp('ethernetInterfaces');
            config.ethernetInterfaces.forEach((eth) => {
                ethernetInterfacesFieldSet.add(
                    {
                        fieldLabel: eth.interface,
                        name: eth.interface,
                        xtype: 'syno_displayfield',
                        value: `MAC: ${eth.address}, Status: ${eth.operstate}, Speed: ${eth.speed}, Duplex: ${eth.duplex}`
                    });
            });
            ethernetInterfacesFieldSet.doLayout();

            var macAdressesFieldSet = Ext.getCmp('macAdresses');
            config.syno_mac_addresses.forEach((mac_address, index) => {
                macAdressesFieldSet.add(
                    {
                        fieldLabel: `Mac ${index}`,
                        columns: 2,
                        xtype: 'syno_displayfield',
                        value: mac_address
                    });
            });

            var debugGeneral = Ext.getCmp('debugGeneral');
            debugGeneral.doLayout();
            self.loaded = true;
        });
    },
    loadForm: function (e) {
        // this.getForm().setValues(e);
    }
});