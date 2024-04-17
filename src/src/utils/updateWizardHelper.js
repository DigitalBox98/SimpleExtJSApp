export default
SYNOCOMMUNITY.RRManager.UpdateWizard.Helper = {
    T: function (a, b) {
        return _T(a, b);
    },
    maskLoading: function (a) {
        a.getEl().mask(this.T("common", "loading"), "x-mask-loading");
    },
    unmask: function (a) {
        a.getEl().unmask();
    },
    mask: function (b, a) {
        b.getEl().mask(a, "x-mask-loading");
    },
    diskSizeRenderer: function (a) {
        return Ext.util.Format.fileSize(a);
    },
    tryUnmaskAndReload: function (a, b, c) {
        this.unmask(a);
        b.reload();
        c();
    },
    getError: function (a) {
        return _T("error", a);
    },
};