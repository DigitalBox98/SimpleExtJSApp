export default
Ext.define("SYNOCOMMUNITY.RRManager.AdvancedSearchField", {
    extend: "SYNO.ux.SearchField",
    initEvents: function () {
        this.callParent(arguments),
            this.mon(Ext.getDoc(), "mousedown", this.onMouseDown, this),
            this.mon(this, "keypress", (function (e, t) {
                t.getKey() === Ext.EventObject.ENTER && (this.searchPanel?.setKeyWord(this.getValue()),
                    this.searchPanel?.onSearch())
            }
            ), this),
            this.mon(this, "destroy", (function () {
                this.searchPanel?.destroy()
            }
            ), this)
    },
    isInnerComponent: function (event, form) {
        let isInside = false;
        if (event.getTarget(".syno-datetimepicker-inner-menu")) {
            isInside = true;
        }
        form.items.each((item) => {
            if (item instanceof Ext.form.ComboBox) {
                if (item.view && event.within(item.view.getEl())) {
                    isInside = true;
                    return false;
                }
            } else if (item instanceof Ext.form.DateField) {
                if (item.menu && event.within(item.menu.getEl())) {
                    isInside = true;
                    return false;
                }
            } else if (item instanceof Ext.form.CompositeField && this.isComponentInside(event, item)) {
                isInside = true;
                return false;
            }
        }, this);
        return isInside;

    },
    onMouseDown: function (e) {
        const t = this.searchPanel;
        !t || !t.isVisible() || t.inEl || e.within(t.getEl()) || e.within(this.searchtrigger) || this.isInnerComponent(e, this.searchPanel.getForm()) || t.hide()
    },
    onSearchTriggerClick: function () {
        this.searchPanel.isVisible() ? this.searchPanel.hide() : (this.searchPanel.getEl().alignTo(this.wrap, "tr-br?", [6, 0]),
            this.searchPanel.show(),
            this.searchPanel.setKeyWord(this.getValue()))
    },
    onTriggerClick: function () {
        this.callParent(),
            this.searchPanel.onReset()
    }
});
