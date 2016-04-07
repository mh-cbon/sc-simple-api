# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  # on fedora-like, you must use the downloadable package of vagrant
  # available on hashi corp website.
  # The per distrib provided package wont provide winrm support..
  # see https://www.vagrantup.com/downloads.html

  config.vm.define :win2012 do |win|
    win.vm.box = "opentable/win-2012r2-standard-amd64-nocm"
    # big timeout since windows boot is very slow
    win.vm.boot_timeout = 500
    win.vm.communicator = :winrm
    win.vm.provider "virtualbox" do |vb|
      # first setup requires gui to be enabled so scripts can be executed in virtualbox guest screen
      #vb.gui = true
      vb.customize ["modifyvm", :id, "--memory", "1024"]
      vb.customize ["modifyvm", :id, "--vram", "128"]
      vb.customize ["modifyvm", :id,  "--cpus", "1"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["guestproperty", "set", :id, "/VirtualBox/GuestAdd/VBoxService/--timesync-set-threshold", 10000]
    end
    # config.vm.provision "shell", inline: ". C:\\vagrant\\node-setup.bat | Write-Output"
  end

end
