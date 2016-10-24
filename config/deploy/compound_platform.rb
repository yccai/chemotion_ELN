#server 'compound-platform.ioc.kit.edu', user: 'complat', roles: %w{app web db}
#set :repo_url, 'git@git.scc.kit.edu:ComPlat/chemotion_ELN.git'

server 'www.complat.eu', user: 'complat', roles: %w{app web db}
set :ssh_options, {
  forward_agent: false,
  auth_methods: %w(publickey)
}
#set :pty, false

#set :repo_url, 'git@github.com:complat/chemotion_ELN.git'

set :deploy_to, '/home/complat/www/chemotion'
set :user, 'complat'

#set :bundle_without, %w{}.join(' ')
set :bundle_flags, '--frozen --deployment ' #--quiet
