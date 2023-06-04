# SimpleExtJSApp
The aim of this sample application is to demonstrate the usage of the DSM framework based on ExtJS<br><br>
This part includes :
- A test.cgi : it will verify the authentication of the current user under DSM before executing itself (inspired from the DSM Developper's Guide)
- A tar of the API docs : to document the usage of each UI component under DSM (in the docs folder)

This repo doesn't include :
- The SPK package for SimpleExtJSApp. For that refer to the SimpleExtJSApp source in the useful links section available in the [Synology DSM info](https://github.com/DigitalBox98/SimpleExtJSApp/wiki/Synology-DSM-info) page 

Notes : 
- The test CGI is called via an Ajax request (to "/webman/3rdparty/simpleextjsapp/test.cgi" URL) <br>
- Once the SPK is installed on the NAS, the test.cgi is located in "/usr/syno/synoman/webman/3rdparty/simpleextjsapp/test.cgi"
- The package part is generated via SPKSRC

For more information, please refer to the [SimpleExtJSApp Wiki](https://github.com/DigitalBox98/SimpleExtJSApp/wiki) page.

# Demo Application

To have access to the demo application on DSM 7.0, add the below repo to your packages source : <br>
https://digitalbox.go.zd.fr/

Three shortcuts are available under DSM :
- Application launch
- Link to API docs
- Link to DSM Applications docs

![shortcuts](https://user-images.githubusercontent.com/57635141/117481775-be0bce80-af63-11eb-927a-49bf98d08dd4.png)
<img width="177" alt="App-Docs" src="https://github.com/DigitalBox98/SimpleExtJSApp/assets/57635141/83ed547b-44f4-4aee-821c-7c1a27d7d7ac">

<br>

Current application features : 

- Server calls demo : CGI (C, Perl, Python or Bash) or API (Syno, External) : <br>
![call](https://user-images.githubusercontent.com/57635141/117197233-dce55600-ade7-11eb-949b-0dd2eeba4b8f.png)
<br>

- Widgets samples accessible via several tabs : <br>
![tabs](https://user-images.githubusercontent.com/57635141/117197034-93950680-ade7-11eb-8e2b-ccc85ddcc47d.png)
<br>

- Each tab is displaying the corresponding GUI components (standard/advanced) : <br>
![screen](https://user-images.githubusercontent.com/57635141/117197587-48c7be80-ade8-11eb-8fbe-5da66a46c14f.png)
<br>

- Usage of JSonStore to call Syno API or customized CGI : <br>
<img width="986" alt="JSonStore" src="https://github.com/DigitalBox98/SimpleExtJSApp/assets/57635141/2d97f30a-5bbe-4b6d-817c-ac42489ea226">
<br>

- Integrated API docs (UX widgets & components): <br>
<img width="724" alt="API" src="https://user-images.githubusercontent.com/57635141/117019518-c19a1e00-acf5-11eb-87a7-b0559fe10ee9.png">
<br>

- Integrated DSM Applications docs (to understand how these applications are written): <br>
<img width="992" alt="Task-Scheduler" src="https://github.com/DigitalBox98/SimpleExtJSApp/assets/57635141/6e91617b-6c84-4ee8-9651-47cd8f420c8e">
<br>

This page is a work in progress and is to be considered for advanced users : ) <br>


