# -*t mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  config.vm.box = 'CentOS65'
  # Compartir directorio de desarollo de Zimlets
  config.vm.synced_folder "src/", "/opt/zimbra/zimlets-deployed/_dev"

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = 'vagrant/provision/playbook.yml'
    ansible.sudo = true
  end

  config.vm.network 'private_network', ip: '192.168.50.10'
  config.vm.hostname = 'zimbra.zboxapp.dev'
  config.vm.network 'forwarded_port', guest: 7071, host: 7071
  config.vm.network 'forwarded_port', guest: 7110, host: 7110
  config.vm.network 'forwarded_port', guest: 8081, host: 8081
  config.vm.network 'forwarded_port', guest: 9081, host: 9081
  config.vm.network 'forwarded_port', guest: 9082, host: 9082
  config.vm.network 'forwarded_port', guest: 8443, host: 7443
  config.vm.network 'forwarded_port', guest: 80, host: 7080
  config.vm.network 'forwarded_port', guest: 389, host: 7389

  config.vm.provider 'virtualbox' do |v|
    v.name = 'ZimbraVagrant'
    v.memory = 2048
    v.cpus = 2
  end
end
