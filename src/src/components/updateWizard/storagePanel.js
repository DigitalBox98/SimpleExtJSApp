export default
Ext.define("SYNOCOMMUNITY.RRManager.UpdateWizard.StoragePanel", {
    extend: "SYNOCOMMUNITY.RRManager.UpdateWizard.Utils.Step",
    helper: SYNOCOMMUNITY.RRManager.UpdateWizard.Helper,
    selectedVolume: {},
    constructor: function (a) {
        this.callParent([this.fillConfig(a)]);
    },
    fillConfig: function (a) {
        this.store = this.createStore(a);
        this.gridPanel = this.createGridPanel(a);
        var b = {
            headline: this.helper.T("host", "select_storage_desc_new"),
            layout: "fit",
            items: [this.gridPanel],
            listeners: { scope: this, activate: this.onActivate },
        };
        Ext.apply(b, a);
        return b;
    },
    createGridPanel: function (a) {
        return new SYNO.ux.GridPanel({
            cls: "vmm-panel-no-padding",
            flex: 1,
            store: this.store,
            enableHdMenu: false,
            colModel: new Ext.grid.ColumnModel({
                defaults: { sortable: true, width: 120 },
                columns: [
                    { header: this.helper.T("common", "host"), dataIndex: "host_name" },
                    {
                        header: this.helper.T("volume", "volume"),
                        dataIndex: "volume_path",
                        renderer: SYNO.SDS.Utils.StorageUtils.VolumeNameRenderer,
                    },
                    {
                        header: this.helper.T("common", "total_space"),
                        dataIndex: "size",
                        renderer: this.helper.diskSizeRenderer,
                    },
                    {
                        header: this.helper.T("common", "free_space"),
                        dataIndex: "free_size",
                        renderer: this.helper.diskSizeRenderer,
                    },
                ],
            }),
            selModel: new Ext.grid.RowSelectionModel({ singleSelect: true }),
            viewConfig: { trackResetOnLoad: false },
        });
    },
    createStore: function (a) {
        return new SYNO.API.JsonStore({
            api: "SYNO.Virtualization.Repo",
            method: "list_avail_volume",
            version: 1,
            appWindow: a.owner,
            autoDestroy: true,
            root: "volumes",
            fields: [
                { name: "host_name" },
                { name: "host_id" },
                { name: "volume_path" },
                { name: "size" },
                { name: "free_size" },
            ],
            sortInfo: { field: "host_name", direction: "ASC" },
            listeners: {
                scope: this,
                exception: this.onStoreException,
                beforeload: this.onStoreBeforeLoad,
                load: this.onStoreLoad,
            },
        });
    },
    getSelection: function () {
        return this.gridPanel.getSelectionModel().getSelected();
    },
    saveSelectedVolume: function () {
        var a = this.getSelection();
        if (!a) {
            this.selectedVolume = {};
            return;
        }
        this.selectedVolume = this.getValues();
    },
    onStoreException: function () {
        this.helper.unmask(this.owner);
        this.helper.mask(
            this.gridPanel,
            this.helper.T("error", "cluster_not_ready")
        );
        this.owner.getButton("next").disable();
    },
    onStoreBeforeLoad: function (a, b) {
        this.saveSelectedVolume();
    },
    onStoreLoad: function (b) {
        this.helper.unmask(this.owner);
        if (0 !== b.getTotalCount()) {
            this.helper.unmask(this.owner);
            if (
                !this.selectedVolume.hasOwnProperty("host_id") ||
                !this.selectedVolume.hasOwnProperty("volume_path")
            ) {
                return;
            }
            var a = b.findBy(
                function (c) {
                    return (
                        c.get("host_id") === this.selectedVolume.host_id &&
                        c.get("volume_path") === this.selectedVolume.volume_path
                    );
                }.createDelegate(this)
            );
            if (a !== -1) {
                this.gridPanel.getSelectionModel().selectRow(a);
            }
            this.owner.getButton("next").enable();
        } else {
            this.helper.mask(
                this.gridPanel,
                this.helper.T("storage", "no_available_storage")
            );
            this.owner.getButton("next").disable();
        }
    },
    onActivate: function () {
      //  this.helper.unmask(this.gridPanel);
      // this.helper.maskLoading(this.owner);
       // this.store.load();
       this.owner.getButton("next").enable();
    },
    validate: function () {
        // var a = this.getSelection();
        // if (!a) {
        //     this.owner
        //         .getMsgBox()
        //         .alert("alert", this.helper.T("error", "no_storage_error"));
        //     return false;
        // }
        return true;
    },
    getValues: function () {
        return {
            host_id: this.getSelection().get("host_id"),
            volume_path: this.getSelection().get("volume_path"),
        };
    },
    getNext: function () {
        if (!this.validate()) {
            return false;
        }
        this.saveSelectedVolume();
        this.owner.goNext(this.nextId);
        return false;
    },
});