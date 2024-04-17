export default
Ext.define("SYNOCOMMUNITY.RRManager.UpdateWizard.Wizard", {
    extend: "SYNOCOMMUNITY.RRManager.UpdateWizard.Utils.Wizard",
    helper: SYNOCOMMUNITY.RRManager.UpdateWizard.Helper,
    constructor: function (a) {
        this.callParent([this.fillConfig(a)]);
    },
    fillConfig: function (a) {
        var b = {
            cls: "vm-create-wizard",
            steps: [
                new SYNOCOMMUNITY.RRManager.UpdateWizard.ImagePanel({
                    appWin: this,
                    owner: this,
                    imageType: a.imageType,
                    pollingWindow: a.pollingWindow,
                    records: a.records,
                    itemId: "image",
                    nextId: "storage",
                }),
                new SYNOCOMMUNITY.RRManager.UpdateWizard.StoragePanel({
                    appWin: this,
                    owner: this,
                    itemId: "storage",
                    nextId: null,
                }),
            ],
        };
        Ext.apply(b, a);
        return b;
    },
    onOpen: function () {
        this.helper.maskLoading(this);
        // this.sendWebAPI({
        //     api: "SYNO.Virtualization.Repo",
        //     method: "list",
        //     version: 2,
        //     scope: this,
        //     callback: function (f, d, e, b) {
        //         if (!f) {
        //             this.getMsgBox().alert(
        //                 "alert",
        //                 this.helper.getError(d.code),
        //                 function () {
        //                     this.close();
        //                 },
        //                 this
        //             );
        //             return;
        //         }
        //         var a = false;
        //         d.repos.every(function (g) {
        //             if ("healthy" === g.status_type || "warning" === g.status_type) {
        //                 a = true;
        //                 return false;
        //             }
        //             return true;
        //         });
        //         if (!a) {
        //             var c = this.helper.createLinkText(
        //                 this.helper.T("common", "here_to_go")
        //             );
        //             this.getMsgBox().alert(
        //                 "alert",
        //                 String.format(
        //                     "{0} ({1})",
        //                     this.helper.T("error", "no_available_storage"),
        //                     c.linkText
        //                 ),
        //                 function () {
        //                     this.close();
        //                 },
        //                 this
        //             );
        //             Ext.get(c.id).on(
        //                 {
        //                     click: function () {
        //                         this.owner.selectPage("SYNO.SDS.Virtualization.Storage.Panel");
        //                         this.close();
        //                     }.createDelegate(this),
        //                 },
        //                 this
        //             );
        //             return;
        //         }
                this.helper.unmask(this);
        //     },
        // });
        this.callParent(arguments);
    },
});
