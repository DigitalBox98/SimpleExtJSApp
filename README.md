# SimpleExtJSApp
The aim of this sample application is to demonstrate the usage of the DSM framework based on ExtJS<br><br>
This part includes :
- A test.cgi : it will verify the authentication of the current user under DSM before executing itself (inspired from the DSM Developper's Guide)
- A tar of the API docs : to document the usage of each UI component under DSM (in the docs folder)
- A tar of the apps/modules docs : to document how apps are using the UI components and framework (in the docs folder)

This repo doesn't include :
- The SPK package for SimpleExtJSApp. For that refer to the SimpleExtJSApp source in the useful links section available in the [Synology DSM info](https://github.com/DigitalBox98/SimpleExtJSApp/wiki/Synology-DSM-info) page 

Notes : 
- The test CGI is called via an Ajax request (to "/webman/3rdparty/simpleextjsapp/test.cgi" URL) <br>
- Once the SPK is installed on the NAS, the test.cgi is located in "/usr/syno/synoman/webman/3rdparty/simpleextjsapp/test.cgi"
- The package part is generated via SPKSRC

For more information, please refer to the [SimpleExtJSApp Wiki](https://github.com/DigitalBox98/SimpleExtJSApp/wiki) page.

# Demo Application

Three shortcuts are available under DSM :
- Application launch
- Link to API docs
- Link to Apps docs
<br>
<img width="478" alt="shortcuts" src="https://user-images.githubusercontent.com/57635141/117018890-3a4caa80-acf5-11eb-94bc-9b81b11d4b44.png">
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


- Integrated API docs (UX widgets & components): <br>
<img width="724" alt="API" src="https://user-images.githubusercontent.com/57635141/117019518-c19a1e00-acf5-11eb-87a7-b0559fe10ee9.png">
<br>

- Integrated Apps docs (3rdparty/modules) : <br>
<img width="844" alt="apps" src="https://user-images.githubusercontent.com/57635141/117019545-c8c12c00-acf5-11eb-91be-8a4f2319b93a.png">
<br>


This page is a work in progress and is to be considered for advanced users : ) <br>


