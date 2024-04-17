// Namespace definition
Ext.ns('SYNOCOMMUNITY.RRManager');
import AppWindow from './appWindow';

//tab main
import Main from './tabs/main';
import HealthPanel from './panels/healthPanel';

//tab addons
import Addons from './tabs/addons';
import AdvancedSearchField from './components/AdvancedSearchField';

//tab settings(configuration)
import Settings from './tabs/setting';
import SettingsGeneralTab from './panels/settings/generalTab';
import RRConfigTab from './panels/settings/rrConfigTab';
import SynoInfoTab from './panels/settings/synoInfoTab';

//tab debug
import Debug from './tabs/debug';
import DebugGeneralTab from './panels/debug/generalTab';

//UpdateWizard
import UtilsStep from './components/updateWizard/utilsStep';
import UpdateWizardHelper from './utils/updateWizardHelper';
import UtilsWizard from './components/updateWizard/utilsWizard';
import UpdateWizard from './components/updateWizard/wizard';
import ImagePanel from './components/updateWizard/imagePanel';
import NewImagePanel from './components/updateWizard/newImagePanel';
import StoragePanel from './components/updateWizard/storagePanel';



// Application definition
Ext.define('SYNOCOMMUNITY.RRManager.AppInstance', {
    extend: 'SYNO.SDS.AppInstance',
    appWindowName: 'SYNOCOMMUNITY.RRManager.AppWindow',
    constructor: function () {
        this.callParent(arguments)
    }
});

SYNOCOMMUNITY.RRManager.SetEmptyIcon = (e, t) => {
    let i = e.el.child(".contentwrapper");
    if (i) {
        for (; i.child(".contentwrapper");)
            i = i.child(".contentwrapper");
        t && !i.hasClass("san-is-empty") ? i.addClass("san-is-empty") : !t && i.hasClass("san-is-empty") && i.removeClass("san-is-empty")
    }
};