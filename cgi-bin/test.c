#define _GNU_SOURCE 
#include <stdio.h> 
#include <stdlib.h> 
#include <string.h> 
#include <strings.h>

int IsUserLogin(char *user, int bufsize) 
{
  FILE *fp = NULL; 
  char buf[1024]; 
  int login = 0;

  bzero(user, bufsize);
  fp = popen("/usr/syno/synoman/webman/modules/authenticate.cgi", "r"); 
  if (!fp) {
       return 0;
  } 

  bzero(buf, sizeof(buf));
  fread(buf, 1024, 1, fp);

  if (strlen(buf) > 0) {
    snprintf(user, bufsize, "%s", buf); 
    login = 1;
  } 
  pclose(fp);

  return login; 
}

int main(int argc, char **argv)
{
  char user[256];
  printf("Content-Type: text/html\r\n\r\n"); 

  if (IsUserLogin(user, sizeof(user)) == 1) {
    printf("User is authenticated %s\n", user); } 
  else {
    printf("User is not authenticated.\n"); 
  }

  return 0; 
}

