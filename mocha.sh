vagrant up win2012
vagrant winrm win2012 -c ". C:\\vagrant\\run-test.bat | Write-Output"
vagrant halt win2012
