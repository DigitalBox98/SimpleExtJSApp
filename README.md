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

# Demo Application

Three shortcut are available in DSM :
- Application launch
- Link to API docs
- Link to Apps docs
<br>
<img width="478" alt="shortcuts" src="https://user-images.githubusercontent.com/57635141/117018890-3a4caa80-acf5-11eb-94bc-9b81b11d4b44.png">
<br>

Inside the application, the server calls include : CGI (C, Perl, Python or Bash) or API (Syno, External) : <br>
![call](https://user-images.githubusercontent.com/57635141/117196590-f8039600-ade6-11eb-99e0-61421c3bbae1.png)
<br>

Widgets samples can be accessed via several tabs : <br>
<img width="557" alt="dsmui2" src="https://user-images.githubusercontent.com/57635141/117019212-80a20980-acf5-11eb-8e7d-5b61d5db3402.png">
<br>

Integrated API docs: <br>
<img width="724" alt="API" src="https://user-images.githubusercontent.com/57635141/117019518-c19a1e00-acf5-11eb-87a7-b0559fe10ee9.png">
<br>

Integrated apps docs: <br>
<img width="844" alt="apps" src="https://user-images.githubusercontent.com/57635141/117019545-c8c12c00-acf5-11eb-91be-8a4f2319b93a.png">
<br>


This page is to be considered as a work in progress for advanced users : ) <br>


