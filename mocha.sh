vagrant up win2012
vagrant winrm win2012 -c ". C:\\vagrant\\run-tests.bat | Write-Output"
vagrant halt win2012
