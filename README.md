# SimpleExtJSApp
The aim of this sample application is to demonstrate the usage of the DSM framework based on ExtJS<br><br>
This part includes :
- A test.cgi : it will verify the authentication of the current user under DSM before executing itself (inspired from the DSM Developper's Guide)
- A tar of the API docs : to document the usage of each UI component under DSM (in the docs folder)

This repo doesn't include :
- The SPK package for SimpleExtJSApp (for that check the SimpleExtJSApp source in the useful links section)

Notes : 
- The test CGI is called via an Ajax request to the "/webman/3rdparty/simpleextjsapp/test.cgi" URL <br>
- Once the SPK is installed on the NAS, the test.cgi will be located in "/usr/syno/synoman/webman/3rdparty/simpleextjsapp/test.cgi"
- The package part can be generated via SPKSRC

Demo Application: <br>

Shortcut to application or to API docs :<br>
<img width="324" alt="shortcuts" src="https://user-images.githubusercontent.com/57635141/116785451-eb570900-aa99-11eb-9393-3e8ef9dce0ed.png">

Server calls include : CGI (C, Perl, Python or Bash) or Syno API : <br>
![dsmui](https://user-images.githubusercontent.com/57635141/116911026-a2908300-ac46-11eb-903e-c584e7375b83.png) <br>

Widgets samples : <br>
<img width="585" alt="GUI2" src="https://user-images.githubusercontent.com/57635141/116785435-cfebfe00-aa99-11eb-88f5-e441c23baa2e.png"> <br>

Integrated API docs: <br>
<img width="788" alt="docs" src="https://user-images.githubusercontent.com/57635141/116785494-20fbf200-aa9a-11eb-9d47-9c9e186c634c.png">


This page is to be considered as a work in progress with more information to come : ) <br>

# Synology DSM info
The Synology DSM client part is based on ExtJS 3.4 library <br><br>

Below is the location of each part of the DSM client framework :<br> 

| DSM client part | Location on NAS |
|----------|:-------------:|
| Synology JS lib | /usr/syno/synoman/synoSDSjslib/sds.js |
| Synology ExtJS UX widgets | /usr/syno/synoman/scripts/ext-3.4/ux/ux-all.js |
| ExtJS 3.4 | /usr/syno/synoman/scripts/ext-3.4/ext-all.js |
| DSM modules | /usr/syno/synoman/webman/modules |
| DSM 3rd party | /usr/syno/synoman/webman/3rdparty |

# ExtJS 3.4 framework info
Available at : http://cdn.sencha.com/ext/gpl/3.4.1.1/release-notes.html<br>

# Useful links

Usage of ExtJS in DSM : https://github.com/SynoCommunity/spksrc/tree/master/spk/debian-chroot/src <br>
Usage of ExtJS + API in DSM : https://github.com/Rutorai/syno-library/wiki <br>
Tentative to API writing : https://github.com/Rutorai/syno-library/tree/develop/package/ <br>
SimpleExtJSApp source : https://github.com/DigitalBox98/spksrc/tree/simpleextjsapp/spk/simpleextjsapp/src/app <br>

# How the documentation is generated :

The original/commented files are inside the docs/synoextjsdocs-source.tar.gz file.
JSduck is required to generate the documentation

To generate the documentation, the steps are quite simple :
- tar -xvf synoextjsdocs-source.tar.gz file
- cd SynoExtJSDocs
- jsduck syno/ --output docs

# How the documentation is enriched :

The steps to enrich the API documentation is as below : 
- If possible, before enriching the documentation, the SimpleExtJSApp application will be updated to contain the additional GUI component
- Add comments for the desired DSM component in the corresponding source file in the "syno" directory 
- Identify if this component extends from ExtJS 3.4 component 
- If so, copy the corresponding ExtJS 3.4 source file from the "ext-3.4.1/src/" directory to the "syno/scripts/ext-3.4/src/" directory by applying the same directory structure
- Follow the next steps described in "how the documentation is generated"

That's it ! <br>

Below is an example of comments added which will be used during the documentation generation : <br>

```javascript
/**
 * @class SYNO.ux.Button
 * @extends Ext.Button
 * Simple Button class
 * @xtype syno_button
 *
 */
```

# Documentation in progress :

<br>
- UX part :<br><br>

| Widget | Documentation |
|----------|:-------------:|
| SYNO.ux.AriaComponent |  |
| SYNO.ux.BackNextBtnGroup (xtype: "syno_backnextbtngroup") |  |
| SYNO.ux.Button (xtype: "syno_button") | :ok: |
| SYNO.ux.Checkbox (xtype: "syno_checkbox") | :ok: |
| SYNO.ux.ColorField (xtype: "syno_colorfield") |  |
| SYNO.ux.ComboBox (xtype: "syno_combobox") | :ok: |
| SYNO.ux.CompositeField (xtype: "syno_compositefield") | :ok: |
| SYNO.ux.CoverPanel (xtype: "syno_coverpanel")|  |
| SYNO.ux.DDGridPanel (xtype: "syno_dd_gridpanel") |  |
| SYNO.ux.DataViewAnimation |  |
| SYNO.ux.DataViewMask |  |
| SYNO.ux.DateField (xtype: "syno_datefield") |  |
| SYNO.ux.DateMenu |  |
| SYNO.ux.DatePicker |  |
| SYNO.ux.DateTime.SubMenu (xtype: "syno_datetime_submenu") |  |
| SYNO.ux.DateTimeField (xtype: "syno_datetimefield") |  |
| SYNO.ux.DateTimeMenu |  |
| SYNO.ux.DateTimePicker (xtype: "syno_datetimepickerfield") |  |
| SYNO.ux.DisplayField (xtype: "syno_displayfield") | :ok: |
| SYNO.ux.EditorGridPanel (xtype: "syno_editorgrid") |  |
| SYNO.ux.EnableColumn |  |
| SYNO.ux.ExpandableListView |  |
| SYNO.ux.FieldSet (xtype: "syno_fieldset") |  |
| SYNO.ux.FileButton (xtype: "syno_filebutton") |  |
| SYNO.ux.FixColGrid (xtype: "syno_fixedcolumn_grid") |  |
| SYNO.ux.FleXcroll.ComboBox | :ok: |
| SYNO.ux.FleXcroll.DataView (xtype: "syno_flexcroll_dataview") |  |
| SYNO.ux.FleXcroll.grid.BufferView |  |
| SYNO.ux.FleXcroll.grid.GridView |  |
| SYNO.ux.FleXcroll.grid.HorizontalGridView |  |
| SYNO.ux.FleXcroll.grid.TreeView |  |
| SYNO.ux.FloatLayout |  |
| SYNO.ux.FormPanel (xtype: "syno_formpanel") |  |
| SYNO.ux.GridPanel (xtype: "syno_gridpanel") |  |
| SYNO.ux.GroupingView |  |
| SYNO.ux.HistoryRecorder |  |
| SYNO.ux.HorizontalGridPanel (xtype: "syno_h_gridpanel") |  |
| SYNO.ux.InvalidQuickTip (xtype: "syno_invalidquicktip") |  |
| SYNO.ux.InverseFieldSet (xtype: "syno_inversefieldset") |  |
| SYNO.ux.MacTextField (xtype: "syno_mactextfield") |  |
| SYNO.ux.Menu (xtype: "syno_menu") |  |
| SYNO.ux.ModuleList (xtype: "syno_modulelist") |  |
| SYNO.ux.NumberField (xtype: "syno_numberfield") |  |
| SYNO.ux.OperatableListView |  |
| SYNO.ux.PageLessToolbar (xtype: "syno_pageless") |  |
| SYNO.ux.PagingToolbar (xtype: "syno_paging") |  |
| SYNO.ux.PagingToolbar (xtype: "syno_paging") |  |
| SYNO.ux.Panel (xtype: "syno_panel") |  |
| SYNO.ux.Radio (xtype: "syno_radio") |  |
| SYNO.ux.RadioGroup (xtype: "syno_radio") |  |
| SYNO.ux.ScheduleField (xtype: "syno_schedulefield") |  |
| SYNO.ux.ScheduleSelector |  |
| SYNO.ux.ScheduleTable |  |
| SYNO.ux.ScheduleTableField |  |
| SYNO.ux.SearchField (xtype: "syno_searchfield")  |  |
| SYNO.ux.SingleSlider (xtype: "syno_singleslider") |  |
| SYNO.ux.SliderField (xtype: "syno_sliderfield") |  |
| SYNO.ux.SplitButton (xtype: "syno_splitbutton") |  |
| SYNO.ux.SplitButton (xtype: "syno_splitbutton") |  |
| SYNO.ux.StateButtonGroup (xtype: "syno_statebuttongroup")|  |
| SYNO.ux.StateButtonGroup |  |
| SYNO.ux.StatusProxy |  |
| SYNO.ux.SuperBoxSelect (xtype: "syno_superboxselect") |  |
| SYNO.ux.SuperBoxSelectItem |  |
| SYNO.ux.Switch (xtype: "syno_switch") |  |
| SYNO.ux.SwitchColumn (xtype: "syno_swtichcolumn") |  |
| SYNO.ux.TabPanel (xtype: "syno_tabpanel") |  |
| SYNO.ux.TextArea (xtype: "syno_textarea") | :ok: |
| SYNO.ux.TextField (xtype: "syno_textfield") | :ok: |
| SYNO.ux.TextFilter (xtype: "syno_textfilter") |  |
| SYNO.ux.TimeField (xtype: "syno_timefield") |  |
| SYNO.ux.TimePickerField (xtype: "syno_timepickerfield") |  |
| SYNO.ux.Toolbar (xtype: "syno_toolbar") |  |
| SYNO.ux.TreePanel |  |
| SYNO.ux.TriModeCheckbox |  |
| SYNO.ux.WhiteQuickTip |  |
| SYNO.ux.WhiteTipIcon |  |
| SYNO.ux._ButtonARIA |  |
| SYNO.ux._CheckboxARIA |  |
| SYNO.ux._ComboboxARIA |  |
| SYNO.ux._ComponentARIA |  |
| SYNO.ux._DataViewARIA |  |
| SYNO.ux._GridPanelARIA |  |
| SYNO.ux._MenuARIA |  |
| SYNO.ux._SliderARIA |  |
| SYNO.ux._TabPanelARIA |  |
| SYNO.ux._TreePanelARIA |  |
| SYNO.ux.data.TreeReader |  |
| SYNO.ux.grid.GridView.SplitDragZone |  |
| SYNO.ux.plugin.GroupHeaderGrid |  |
| SYNO.ux.plugin.StyledGrid |  |

<br>
- SDS part : <br><br>

| Component | Documentation |
|----------|:-------------:|
| Ext.data.JsonP |  |
| SYNO.API.CompoundReader |  |
| SYNO.API.InfoObject |  |
| SYNO.API.QueryAPI |  |
| SYNO.SDS.AboutWindow |  |
| SYNO.SDS.AbstractWindow | :ok:  |
| SYNO.SDS.AppWindow | :ok: |
| SYNO.SDS.AppMgr |  |
| SYNO.SDS.Background |  |
| SYNO.SDS.CacheConfirmMessage |  |
| SYNO.SDS.CustomizeLogo |  |
| SYNO.SDS.EnforceOTPWizard |  |
| SYNO.SDS.EnforceOTPWizard.AuthStep |  |
| SYNO.SDS.EnforceOTPWizard.FinishStep |  |
| SYNO.SDS.EnforceOTPWizard.QRcodeStep |  |
| SYNO.SDS.EnforceOTPWizard.QRcodeStep.EditDialog |  |
| SYNO.SDS.EnforceOTPWizard.WelcomeStep |  |
| SYNO.SDS.FullScreenToolbar |  |
| SYNO.SDS.JSLoader |  |
| SYNO.SDS.MessageBoxV5 |  |
| SYNO.SDS.ModalWindow |  |
| SYNO.SDS.RebootPowerOff.Window |  |
| SYNO.SDS.SearchResultPanel |  |
| SYNO.SDS.ToastBox |  |
| SYNO.SDS.Tray.ArrowTray |  |
| SYNO.SDS.Tray.Panel |  |
| SYNO.SDS.Utils.ActionGroup |  |
| SYNO.SDS.Utils.EnableCheckGroup |  |
| SYNO.SDS.Utils.EnableRadioGroup |  |
| SYNO.SDS.Utils.GroupingView |  |
| SYNO.SDS.Utils.IconBadge |  |
| SYNO.SDS.Utils.InnerGroupingView |  |
| SYNO.SDS.Utils.Logout |  |
| SYNO.SDS.Utils.Notify.Badge |  |
| SYNO.SDS.VuePanel |  |
| SYNO.SDS.WelcomeInfo |  |
| SYNO.SDS.WidgetWindow |  |
| SYNO.SDS.WindowLauncher |  |
| SYNO.SDS.WindowLauncher.Util |  |
| SYNO.SDS.Wizard.ApplyStep |  |
| SYNO.SDS.Wizard.AppWindow |  |
| SYNO.SDS.Wizard.BaseWindow |  |
| SYNO.SDS.Wizard.ModalWindow |  |
| SYNO.SDS.Wizard.Step |  |
| SYNO.SDS.Wizard.StepContainer |  |
| SYNO.SDS.Wizard.SummaryStep |  |
| SYNO.SDS.Wizard.SummaryStore |  |
| SYNO.SDS.Wizard.TaskStore |  |
| SYNO.SDS.Wizard.WelcomeStep |  |
| SYNO.SDS._FocusMgr |  |
| SYNO.SDS._Menu |  |
| SYNO.SDS._OverflowButton |  |
| SYNO.SDS._OverflowMenu |  |
| SYNO.SDS._System |  |
| SYNO.SDS._SystemTray.Component |  |
| SYNO.SDS._TaskBar |  |
| SYNO.SDS._TaskBar.Left |  |
| SYNO.SDS._TaskButtons.Button |  |
| SYNO.SDS._UserMenu |  |
| SYNO.ux.MessageComboBox |  |
| SYNO.ux.PasswordField |  |
| SYNO.ux.StorageComboBox |  |

<br>
- modules part : <br><br>

| Application | Documentation |
|----------|:-------------:|
| AdminCenter |  |
| AppNotify |  |
| AudioPlayer |  |
| BackgroundTaskMonitor |  |
| BandwidthControl |  |
| C3 |  |
| Chooser |  |
| ClipBoardJS |  |
| ConfigBackup |  |
| DataDrivenDocuments |  |  
| DisableAdminNotification |  |  
| DiskMessageHandler |  |  
| DSMMobile |  |  
| DSMNotify |  |  
| DSMUpdateNotify |  |  
| Echarts |  |  
| ExternalDevices |  |  
| FileBrowser |  |  
| FileChooser |  |  
| FileChooserV6 |  |  
| FileSharing |  |  
| HelpBrowser |  |  
| HotkeyManager |  |  
| Indexer |  |  
| LegacyApps |  |  
| LogCenter |  |  
| login.cgi |  |  
| LoginNotify |  |  
| MyDSCenter |  |  
| OTPWizard |  |  
| PersonalNotification |  |  
| PersonalSettings |  |  
| PhotoViewer |  |  
| PkgManApp |  |  
| PollingTask |  |  
| PortEnable |  |  
| ResetAdminApp |  |  
| ResourceMonitor |  |  
| SecurityScan |  |  
| Share |  |  
| SharingManager |  |  
| StorageManager |  |  
| SupportForm |  |  
| SynologyAccount |  |  
| SystemInfoApp |  |  
| SystemStatusChecker |  |  
| TaskSchedulerUtils |  |  
| TaskSchedulerWidget |  |  
| ThumbConvertProgress |  |  
| TinyMCE |  |  
| UpdateMaskApp |  |  
| Utils |  |  
| VideoPlayer2 |  |  
| WelcomeApp |  |  
| Widgets | partial |

<br>
- 3rdparty part : <br><br>

| Application | Documentation |
|----------|:-------------:|
| ActiveInsight |  |
| AudioStation |  |
| CloudDownloader |  |
| DiagnosisTool |  |
| Docker |  |
| DockerShortcut |  |
| DownloadStation |  |
| FileBrowser |  |
| FileTaskMonitor |  |
| Git |  |
| HybridShare |  |
| HyperBackup |  |
| LogCenter |  |
| MariaDB10 |  |
| OAuthService |  |
| PlexMediaServer |  |
| ScsiTarget |  |
| SecureSignIn |  |
| SMBService |  |
| Spreadsheet |  |
| SynoFinder |  |
| SynologyApplicationService |  |
| SynologyDrive |  |
| SynologyDrive-Drive |  |
| SynologyDrive-ShareSync |  |
| SynologyPhotos |  |
| TextEditor |  |
| USBCopy | partial |
| VideoStation |  |
| WebService |  |
| WebStation |  |

<br>
