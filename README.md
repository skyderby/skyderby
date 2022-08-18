# Skyderby

[![Code Climate](https://codeclimate.com/github/skyderby/skyderby/badges/gpa.svg)](https://codeclimate.com/github/skyderby/skyderby)
[![Test Coverage](https://codeclimate.com/github/skyderby/skyderby/badges/coverage.svg)](https://codeclimate.com/github/skyderby/skyderby/coverage)
[![CI](https://github.com/skyderby/skyderby/actions/workflows/ci.yml/badge.svg)](https://github.com/skyderby/skyderby/actions/workflows/ci.yml)
[![View performance data on Skylight](https://badges.skylight.io/status/WhKRVcRJzg2z.svg)](https://oss.skylight.io/app/applications/WhKRVcRJzg2z)

## Why Skyderby exists?

In April 2014 I finally got the GPS tracker. After a couple of wingsuit jumps with it I wanted to check my results and faced the following problem: all existing services (free or commercial) didn’t show any results at all or showed it in a very uncomfortable way.

So I decided to create a new application.

## Development

### Setting up a development environment

- Install `asdf` - See https://asdf-vm.com/guide/getting-started.html
- Install asdf plugins:
  - `asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git`
  - `asdf install nodejs latest`
  - `asdf plugin add ruby https://github.com/asdf-vm/asdf-ruby.git`
  - `asdf install ruby latest`
- Install Docker
- Install `postgres` with `sudo apt-get install postgresql libpq-dev`
- Install `yarn` with `npm install -g yarn`
- Clone the skyderby git repository with `git clone https://github.com/skyderby/skyderby.git`
- `cd` into the repository
- `asdf install`
- `bundle install`
- `yarn`
- `cp .env.example .env`
- Configure postgres to trust local connections. Edit `/etc/postgresql/12/main/pg_hba.conf` as follows:
```
- local   all             all                                     peer
+ local   all             all                                     trust
- host    all             all             127.0.0.1/32            md5
+ host    all             all             127.0.0.1/32            trust
```
- After editing the file, `sudo service postgresql restart`
- Run the following `rails` commands to initialize a database:
  - `rails db:create`
  - `rails db:schema:load`
  - `rails db:seed`
- Start the services:
  - In one terminal, run `bin/webpacker-dev-server`
  - And in another one, run `rails server`
- To create an admin user, run `rails console` and enter the following commands:
  - `User.create!(email: 'someone@example.com', password: 'asecretpw', password_confirmation: 'asecretpw', profile_attributes: { name: 'Admin User' })`
  - `User.last.update!(confirmed_at: Date.today)`
  - `Role.pluck(:name)`
  - `User.last.roles << Role.find_by(name: 'admin')`
- Visit `http://127.0.0.1:3000`
- Log in with your admin user email and password

### TODO

- Fix postgres usage so that the config file doesn't need to be edited
- Redis installation instructions, and documenting what it's needed for

## Million Thanks to

Alex and Svetlana Rubinshtein, Shane Dunn, Aleksey Shatilov, Valeriy Salcutsan, Simon Repton, Evgeniy Pavlov, Egor Orlow, Simon Perriard, Aleksey Galda, Flo Kas, Csaba Szörényi, Aleksandr Zharikov, Ekaterina Larina,  Tatyana Holm, Yulia Makoveeva, Daniel Duarte, Leonid Sigalov, Sergey Panteleev.

## Technologies we use

Building complex software requires ample toolbox.
Here are just some of the technologies, Skyderby build with:

![Technologies](https://cloud.githubusercontent.com/assets/5262979/24458827/bd08491a-14a2-11e7-8ef3-0e3a56747c8c.png)

## Licensing

Code released under AGPLv3 license.

**Note:**
Skyderby is using [Highcharts JS](http://shop.highsoft.com/highcharts.html) library which is licensed under [Creative Commons Attribution-NonCommercial 3.0 License](http://creativecommons.org/licenses/by-nc/3.0/).
