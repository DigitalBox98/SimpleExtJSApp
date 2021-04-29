# SimpleExtJSApp
Simple ExtJS Application for DSM 7.0 :<br><br>
This part includes a test.cgi, which is verifying the authentication of the current user under DSM. <br> 
The CGI must be called via an Ajax request to the "/webman/3rdparty/simpleextjsapp/test.cgi" URL <br>

The package part can be generated in the spksrc repo in the simpleextjsapp branch. <br>

Application: <br>

![GUI1](https://user-images.githubusercontent.com/57635141/116535086-a38e8100-a8e3-11eb-9fb2-883a69d384ce.png) <br>
![GUI2](https://user-images.githubusercontent.com/57635141/116535121-ad17e900-a8e3-11eb-9293-7ed15f171059.png) <br>

Integrated docs: <br>
![docs](https://user-images.githubusercontent.com/57635141/116140367-871df900-a6d7-11eb-9ba5-602bd9f5e5ba.png)

This page is to be considered as a work in progress with more information to come : ) <br>

# Synology DSM 7.0
The Synology DSM 7.0 client part is based on ExtJS 3.4 library <br><br>

Synology JS lib location : /usr/syno/synoman/synoSDSjslib/sds.js <br>
ExtJS 3.4 location : /usr/syno/synoman/scripts/ext-3.4/ext-all.js <br>
Synology ExtJS additional UX widgets : /usr/syno/synoman/scripts/ext-3.4/ux/ux-all.js <br>

# ExtJS 3.4 framework docs
Available at : http://cdn.sencha.com/ext/gpl/3.4.1.1/release-notes.html<br>

# Documentation in progress :

| Widget | Documentation |
|----------|:-------------:|
| SYNO.ux.Button (xtype: "syno_button") | :ok: |
| SYNO.ux.Checkbox (xtype: "syno_checkbox") | :ok: |
| SYNO.ux.DisplayField (xtype: "syno_displayfield") | :ok: |
| SYNO.ColorField (xtype: "syno_colorfield") |  |
| SYNO.ux.ComboBox (xtype: "syno_combobox") |  |
| SYNO.ux.CoverPanel (xtype: "syno_coverpanel")|  |
| SYNO.ux.GridPanel (xtype: "syno_gridpanel") |  |
| SYNO.ux.DateField (xtype: "syno_datefield") |  |
| SYNO.ux.DateTimeField (xtype: "syno_datetimefield") |  |
| SYNO.ux.TimePickerField (xtype: "syno_timepickerfield") |  |
| SYNO.ux.DateTimePicker (xtype: "syno_datetimepickerfield") |  |
| SYNO.ux.EditorGridPanel (xtype: "syno_editorgrid") |  |
| SYNO.ux.FieldSet (xtype: "syno_fieldset") |  |
| SYNO.ux.FileButton (xtype: "syno_filebutton") |  |
| SYNO.ux.FormPanel (xtype: "syno_formpanel") |  |
| SYNO.ux.Menu (xtype: "syno_menu") |  |
| SYNO.ux.ModuleList (xtype: "syno_modulelist") |  |
| SYNO.ux.NumberField (xtype: "syno_numberfield") |  |
| SYNO.ux.PagingToolbar (xtype: "syno_paging") |  |
| SYNO.ux.Panel (xtype: "syno_panel") |  |
| SYNO.ux.RadioGroup (xtype: "syno_radio") |  |
| SYNO.ux.Radio (xtype: "syno_radio") |  |
| SYNO.ux.SingleSlider (xtype: "syno_singleslider") |  |
| SYNO.ux.SplitButton (xtype: "syno_splitbutton") |  |
| SYNO.ux.StateButtonGroup (xtype: "syno_statebuttongroup")|  |
| SYNO.ux.Switch (xtype: "syno_switch") |  |
| SYNO.ux.TabPanel (xtype: "syno_tabpanel") |  |
| SYNO.ux.TextArea (xtype: "syno_textarea") |  |
| SYNO.ux.TextField (xtype: "syno_textfield") |  |
| SYNO.ux.MacTextField (xtype: "syno_mactextfield") |  |
| SYNO.ux.SearchField (xtype: "syno_searchfield")  |  |
| SYNO.ux.TimeField (xtype: "syno_timefield") |  |
| SYNO.ux.Toolbar (xtype: "syno_toolbar") |  |
| SYNO.ux.FleXcroll.DataView (xtype: "syno_flexcroll_dataview") |  |
| SYNO.ux.ExpandableListView |  |
| SYNO.ux.OperatableListView |  |


# Useful links

Usage of ExtJS in DSM : https://github.com/SynoCommunity/spksrc/tree/master/spk/debian-chroot/src <br>
Usage of ExtJS + API in DSM : https://github.com/Rutorai/syno-library/wiki <br>
Example for writing API : https://github.com/Rutorai/syno-library/tree/develop/package/ <br>
SimpleExtJSApp source : https://github.com/DigitalBox98/spksrc/tree/simpleextjsapp/spk/simpleextjsapp/src/app <br>
